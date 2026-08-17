// Pixel's Realm - protótipo jogável
// Movimentação top-down, ataques automáticos por proximidade (corpo a corpo / distância),
// sistema de nível/XP com modal de escolha de skills, loot básico e personagens
// desenhados como sprites animados em canvas (ciclo de andar, golpe de ataque, dano e morte).

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
window.addEventListener('resize', resize);
resize();

const WORLD = { w: 1600, h: 1200, tile: 40 };

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === '1') setWeapon('sword');
  if (e.key === '2') setWeapon('bow');
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ---------- Sprite real do jogador (Universal LPC Spritesheet) ----------
// Fonte: Liberated Pixel Cup / Universal-LPC-Spritesheet-Character-Generator (CC-BY-SA 3.0 / GPL 3.0)
// https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator
const SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator/675e21e04aaff8486a3a24e09573b3d5af9d28b9/spritesheets/body/bodies/male/light.png';
const bodySprite = new Image();
bodySprite.crossOrigin = 'anonymous';
let bodySpriteReady = false;
bodySprite.onload = () => { bodySpriteReady = true; };
bodySprite.onerror = () => { bodySpriteReady = false; };
bodySprite.src = SPRITE_SHEET_URL;

const FRAME = 64;
const DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };
const SPRITE_BLOCKS = {
  spellcast: { row: 0, frames: 7 },
  thrust: { row: 4, frames: 8 },
  walk: { row: 8, frames: 9 },
  slash: { row: 12, frames: 6 },
  shoot: { row: 16, frames: 13 },
  hurt: { row: 20, frames: 6 }
};

// ---------- Armas ----------
const WEAPONS = {
  sword: { type: 'melee', name: 'Espada Curta', range: 58, cooldown: 0.55 },
  bow:   { type: 'ranged', name: 'Arco Curto', range: 300, cooldown: 0.9, projectileSpeed: 460 }
};

// ---------- Loot ----------
const lootTable = [
  { name: 'Espada Enferrujada', rarity: 'comum', chance: 0.35 },
  { name: 'Poção de Vida', rarity: 'comum', chance: 0.3 },
  { name: 'Anel Antigo', rarity: 'raro', chance: 0.12 },
  { name: 'Adaga Élfica', rarity: 'raro', chance: 0.1 },
  { name: 'Coroa Esquecida', rarity: 'épico', chance: 0.03 },
];
function rollLoot(bonus){
  const roll = Math.random() * (1 - Math.min(0.6, bonus));
  let acc = 0;
  for (const item of lootTable) {
    acc += item.chance;
    if (roll <= acc) return item;
  }
  return null;
}

// ---------- Skills ----------
const SKILL_POOL = [
  { id: 'forca', name: 'Força Bruta', desc: '+2 de dano por nível', max: 5 },
  { id: 'vigor', name: 'Vigor', desc: '+8 de HP máximo por nível', max: 5 },
  { id: 'agilidade', name: 'Agilidade', desc: '+8% de velocidade de movimento por nível', max: 5 },
  { id: 'foco', name: 'Foco de Combate', desc: '-8% no tempo de recarga do ataque por nível', max: 5 },
  { id: 'sorte', name: 'Sorte do Aventureiro', desc: '+10% de chance de loot melhor por nível', max: 5 },
  { id: 'guarda', name: 'Guarda de Ferro', desc: '+2 de defesa por nível', max: 5 },
];

const player = {
  x: WORLD.w / 2, y: WORLD.h / 2, size: 26,
  baseSpeed: 220, baseStr: 4, baseDef: 2, baseHpMax: 30,
  level: 1, xp: 0, xpMax: 20,
  hp: 30, hpMax: 30,
  gold: 0,
  attackTimer: 0, attacking: 0, attackDuration: 0.28, facing: 'down',
  weaponKey: 'sword',
  skills: {},
  walkTime: 0, moving: false
};

function skillLevel(id){ return player.skills[id] || 0; }

function recomputeStats(){
  const oldHpMax = player.hpMax;
  player.str = player.baseStr + skillLevel('forca') * 2;
  player.def = player.baseDef + skillLevel('guarda') * 2;
  player.speed = player.baseSpeed * (1 + skillLevel('agilidade') * 0.08);
  player.cooldownMultiplier = Math.max(0.4, 1 - skillLevel('foco') * 0.08);
  player.lootBonus = skillLevel('sorte') * 0.10;
  player.hpMax = player.baseHpMax + skillLevel('vigor') * 8;
  if (player.hpMax !== oldHpMax) {
    player.hp = Math.min(player.hpMax, player.hp + (player.hpMax - oldHpMax));
  }
  updateHud();
}

function setWeapon(key){
  if (!WEAPONS[key]) return;
  player.weaponKey = key;
  player.attackTimer = 0;
  updateHud();
}

function xpForNextLevel(level){ return 20 + (level - 1) * 15; }

let pendingLevelUps = 0;

function gainXP(amount){
  player.xp += amount;
  while (player.xp >= player.xpMax) {
    player.xp -= player.xpMax;
    player.level += 1;
    player.xpMax = xpForNextLevel(player.level);
    player.baseHpMax += 4;
    logLoot(`Subiu para o nível ${player.level}!`);
    pendingLevelUps += 1;
  }
  recomputeStats();
  player.hp = player.hpMax;
  updateHud();
  if (pendingLevelUps > 0 && !modalOpen) openLevelModal();
}

// ---------- Inimigos ----------
function makeEnemy(x, y){
  return {
    x, y, size: 24, hp: 18, hpMax: 18, str: 3, speed: 70,
    xpReward: 12, goldReward: [2, 6], alive: true, hitFlash: 0,
    wanderAngle: Math.random() * Math.PI * 2, wanderTimer: 0,
    animTime: Math.random() * 10, deathAnim: -1, moving: false
  };
}

let enemies = [];
for (let i = 0; i < 10; i++) {
  enemies.push(makeEnemy(200 + Math.random() * (WORLD.w - 400), 200 + Math.random() * (WORLD.h - 400)));
}

let projectiles = [];
let camera = { x: 0, y: 0 };
let lastTime = performance.now();
let modalOpen = false;
let rerollsLeft = 2;
let currentOffers = [];

// ---------- Ataque automático por proximidade ----------
function tryAutoAttack(dt){
  player.attackTimer -= dt;
  if (player.attackTimer > 0) return;

  const weapon = WEAPONS[player.weaponKey];
  const range = weapon.range;

  let nearest = null, nearestDist = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const dist = Math.hypot(e.x - player.x, e.y - player.y);
    if (dist <= range && dist < nearestDist) { nearest = e; nearestDist = dist; }
  }
  if (!nearest) return;

  player.attackTimer = weapon.cooldown * player.cooldownMultiplier;
  player.attackDuration = weapon.type === 'melee' ? 0.32 : 0.55;
  player.attacking = player.attackDuration;

  const dx = nearest.x - player.x, dy = nearest.y - player.y;
  player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

  if (weapon.type === 'melee') {
    for (const e of enemies) {
      if (!e.alive) continue;
      const dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist <= range) hitEnemy(e);
    }
  } else {
    projectiles.push({
      x: player.x, y: player.y, target: nearest,
      speed: weapon.projectileSpeed, dmg: Math.max(1, Math.round(player.str * 0.85)),
      angle: Math.atan2(dy, dx)
    });
  }
}

function hitEnemy(e, overrideDmg){
  const dmg = overrideDmg != null ? overrideDmg : Math.max(1, player.str);
  e.hp -= dmg;
  e.hitFlash = 0.15;
  if (e.hp <= 0 && e.alive) {
    e.alive = false;
    e.deathAnim = 0;
    gainXP(e.xpReward);
    const gold = Math.floor(e.goldReward[0] + Math.random() * (e.goldReward[1] - e.goldReward[0]));
    player.gold += gold;
    const loot = rollLoot(player.lootBonus);
    if (loot) logLoot(`+${gold} ouro · ${loot.name} (${loot.rarity})`);
    else logLoot(`+${gold} ouro`);
    updateHud();
    setTimeout(() => respawnEnemy(e), 3500);
  }
}

function respawnEnemy(e){
  e.alive = true;
  e.hp = e.hpMax;
  e.deathAnim = -1;
  e.x = 200 + Math.random() * (WORLD.w - 400);
  e.y = 200 + Math.random() * (WORLD.h - 400);
}

function updateProjectiles(dt){
  projectiles = projectiles.filter(p => {
    if (!p.target.alive) return false;
    const dx = p.target.x - p.x, dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) { hitEnemy(p.target, p.dmg); return false; }
    p.angle = Math.atan2(dy, dx);
    p.x += (dx / dist) * p.speed * dt;
    p.y += (dy / dist) * p.speed * dt;
    return true;
  });
}

// ---------- Update / Draw ----------
function update(dt){
  if (modalOpen) return;

  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  const len = Math.hypot(dx, dy);
  player.moving = len > 0;
  if (len > 0) {
    dx /= len; dy /= len;
    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
    player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    player.walkTime += dt * 9;
  } else {
    player.walkTime += dt * 3;
  }
  player.x = Math.max(20, Math.min(WORLD.w - 20, player.x));
  player.y = Math.max(20, Math.min(WORLD.h - 20, player.y));

  if (player.attacking > 0) player.attacking -= dt;

  tryAutoAttack(dt);
  updateProjectiles(dt);

  for (const e of enemies) {
    if (e.deathAnim >= 0) { e.deathAnim += dt; continue; }
    if (!e.alive) continue;
    e.animTime += dt;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    const dx2 = player.x - e.x, dy2 = player.y - e.y;
    const dist = Math.hypot(dx2, dy2);
    if (dist < 240) {
      e.moving = true;
      e.x += (dx2 / dist) * e.speed * dt;
      e.y += (dy2 / dist) * e.speed * dt;
      if (dist < e.size + player.size * 0.5) {
        player.hp -= Math.max(0.4, e.str - player.def * 0.3) * dt * 1.4;
        if (player.hp < 0) player.hp = 0;
        updateHud();
      }
    } else {
      e.wanderTimer -= dt;
      if (e.wanderTimer <= 0) {
        e.wanderAngle = Math.random() * Math.PI * 2;
        e.wanderTimer = 1.5 + Math.random() * 1.5;
      }
      e.moving = true;
      e.x += Math.cos(e.wanderAngle) * e.speed * 0.35 * dt;
      e.y += Math.sin(e.wanderAngle) * e.speed * 0.35 * dt;
    }
    e.x = Math.max(20, Math.min(WORLD.w - 20, e.x));
    e.y = Math.max(20, Math.min(WORLD.h - 20, e.y));
  }

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  camera.x = Math.max(0, Math.min(WORLD.w - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(WORLD.h - canvas.height, camera.y));
}

function drawGround(){
  ctx.fillStyle = '#132018';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  const startX = -camera.x % WORLD.tile;
  const startY = -camera.y % WORLD.tile;
  for (let x = startX; x < canvas.width; x += WORLD.tile) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = startY; y < canvas.height; y += WORLD.tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}

// ---------- Sprite do jogador desenhado processualmente (fallback) ----------
function drawHumanoidFallback(sx, sy, opts){
  const { walkTime, moving, facing, attacking, attackDuration, weaponType, skinColor, tunicColor, hairColor } = opts;
  const legSwing = moving ? Math.sin(walkTime) * 6 : Math.sin(walkTime) * 1.2;
  const bob = moving ? Math.abs(Math.sin(walkTime)) * 2.4 : Math.abs(Math.sin(walkTime * 0.6)) * 0.6;
  const attackProgress = attacking > 0 ? 1 - (attacking / attackDuration) : null;

  ctx.save();
  ctx.translate(sx, sy - bob);

  ctx.fillStyle = '#1b2433';
  ctx.fillRect(-9, 6 + legSwing * 0.4, 8, 16 - legSwing);
  ctx.fillRect(1, 6 - legSwing * 0.4, 8, 16 + legSwing);

  ctx.fillStyle = tunicColor;
  ctx.beginPath();
  ctx.moveTo(-12, -14);
  ctx.lineTo(12, -14);
  ctx.lineTo(15, 10);
  ctx.lineTo(-15, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(-12, 4, 24, 4);

  ctx.fillStyle = skinColor;
  ctx.fillRect(facing === 'left' ? 8 : -12, -8, 6, 14);

  ctx.fillStyle = skinColor;
  ctx.fillRect(-8, -30, 16, 16);
  ctx.fillStyle = hairColor;
  ctx.fillRect(-9, -32, 18, 7);
  if (facing === 'left') ctx.fillRect(-9, -30, 5, 12);
  if (facing === 'right') ctx.fillRect(4, -30, 5, 12);

  const shoulderX = facing === 'left' ? -10 : 10;
  ctx.save();
  ctx.translate(shoulderX, -6);

  let swingAngle = 0;
  if (attackProgress != null && weaponType === 'melee') {
    const t = attackProgress;
    swingAngle = (t < 0.5 ? -1 + t * 4 : 1 - (t - 0.5) * 4) * 1.1;
  } else if (moving) {
    swingAngle = Math.sin(walkTime + Math.PI) * 0.25;
  }
  ctx.rotate(swingAngle * (facing === 'left' ? -1 : 1));

  ctx.fillStyle = skinColor;
  ctx.fillRect(-3, 0, 6, 14);

  if (weaponType === 'melee') {
    ctx.fillStyle = '#c9d3e0';
    ctx.fillRect(-2, 10, 4, 22);
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(-4, 8, 8, 4);
  } else {
    const draw = attackProgress != null ? Math.min(1, attackProgress * 2) : 0.15;
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.quadraticCurveTo(10 + draw * 6, 14, -2, 24);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,230,230,0.85)';
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2 - draw * 10, 14);
    ctx.lineTo(-2, 24);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

// ---------- Sprite real do jogador (spritesheet LPC) ----------
function drawPlayerSprite(sx, sy){
  const weapon = WEAPONS[player.weaponKey];
  const dirRow = DIR_ROW[player.facing];
  let block, frameIndex;

  if (player.attacking > 0) {
    const progress = 1 - (player.attacking / player.attackDuration);
    block = weapon.type === 'melee' ? SPRITE_BLOCKS.slash : SPRITE_BLOCKS.shoot;
    frameIndex = Math.min(block.frames - 1, Math.floor(progress * block.frames));
  } else if (player.moving) {
    block = SPRITE_BLOCKS.walk;
    frameIndex = Math.floor((player.walkTime * 1.5) % block.frames);
  } else {
    block = SPRITE_BLOCKS.walk;
    frameIndex = 0;
  }

  const row = block.row + dirRow;
  const srcX = frameIndex * FRAME;
  const srcY = row * FRAME;
  const scale = 1.7;
  const dw = FRAME * scale, dh = FRAME * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bodySprite, srcX, srcY, FRAME, FRAME, sx - dw / 2, sy - dh * 0.72, dw, dh);
  ctx.restore();
}

function drawPlayer(){
  const sx = player.x - camera.x, sy = player.y - camera.y;
  const weapon = WEAPONS[player.weaponKey];

  if (bodySpriteReady) {
    drawPlayerSprite(sx, sy);
  } else {
    drawHumanoidFallback(sx, sy, {
      walkTime: player.walkTime, moving: player.moving, facing: player.facing,
      attacking: player.attacking, attackDuration: player.attackDuration,
      weaponType: weapon.type,
      skinColor: '#c98f66', tunicColor: '#2c4d82', hairColor: '#2c241f'
    });
  }

  if (player.attacking > 0) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.strokeStyle = 'rgba(220,230,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, weapon.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- Sprite dos inimigos (procedural) ----------
function drawEnemySprite(sx, sy, e){
  const squish = e.moving ? Math.abs(Math.sin(e.animTime * 6)) * 0.12 : Math.abs(Math.sin(e.animTime * 2)) * 0.04;
  let scaleX = 1 + squish, scaleY = 1 - squish, alpha = 1;

  if (e.deathAnim >= 0) {
    const t = Math.min(1, e.deathAnim / 0.4);
    scaleX = 1 - t * 0.4;
    scaleY = 1 - t * 0.4 + t * 0.5;
    alpha = 1 - t;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(sx, sy);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#8a3838';
  ctx.beginPath();
  ctx.moveTo(-e.size / 2, e.size / 2);
  ctx.quadraticCurveTo(-e.size / 2, -e.size / 2, 0, -e.size / 2 - 4);
  ctx.quadraticCurveTo(e.size / 2, -e.size / 2, e.size / 2, e.size / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3a1414';
  ctx.fillRect(-e.size / 2 + 3, e.size / 2 - 4, 6, 6);
  ctx.fillRect(e.size / 2 - 9, e.size / 2 - 4, 6, 6);

  ctx.fillStyle = '#ffe66b';
  const eyeOffset = e.moving ? Math.sin(e.animTime * 6) * 1.4 : 0;
  ctx.fillRect(-6 + eyeOffset, -e.size / 2 + 2, 4, 4);
  ctx.fillRect(3 + eyeOffset, -e.size / 2 + 2, 4, 4);

  ctx.restore();

  if (e.alive) {
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(sx - e.size / 2, sy - e.size / 2 - 10, e.size, 4);
    ctx.fillStyle = '#e05c5c';
    ctx.fillRect(sx - e.size / 2, sy - e.size / 2 - 10, e.size * (e.hp / e.hpMax), 4);
  }
}

function drawEnemies(){
  for (const e of enemies) {
    if (!e.alive && e.deathAnim < 0) continue;
    if (!e.alive && e.deathAnim >= 0.4) continue;
    const sx = e.x - camera.x, sy = e.y - camera.y;
    if (sx < -60 || sx > canvas.width + 60 || sy < -60 || sy > canvas.height + 60) continue;
    drawEnemySprite(sx, sy, e);
  }
}

function drawProjectiles(){
  for (const p of projectiles) {
    const sx = p.x - camera.x, sy = p.y - camera.y;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.angle || 0);
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(-8, -1, 14, 2);
    ctx.fillStyle = '#f0dc8f';
    ctx.fillRect(5, -2, 4, 4);
    ctx.restore();
  }
}

function draw(){
  drawGround();
  drawEnemies();
  drawProjectiles();
  drawPlayer();
}

function loop(now){
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Modal de nível ----------
const levelModal = document.getElementById('levelModal');
const modalOptions = document.getElementById('modalOptions');
const rerollBtn = document.getElementById('rerollBtn');
const rerollCount = document.getElementById('rerollCount');

function pickOffers(){
  const pool = [...SKILL_POOL];
  const offers = [];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  for (const skill of shuffled) {
    if (offers.length >= 3) break;
    if (skill.max && skillLevel(skill.id) >= skill.max) continue;
    offers.push(skill);
  }
  while (offers.length < 3 && pool.length) offers.push(pool[Math.floor(Math.random() * pool.length)]);
  return offers.slice(0, 3);
}

function renderOffers(){
  modalOptions.innerHTML = '';
  currentOffers.forEach(skill => {
    const lvl = skillLevel(skill.id);
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-name">${skill.name}</div>
      <div class="option-desc">${skill.desc}</div>
      <div class="option-level">${lvl > 0 ? `Nível ${lvl} → ${lvl + 1}` : 'Nova habilidade'}</div>
    `;
    card.addEventListener('click', () => chooseSkill(skill.id));
    modalOptions.appendChild(card);
  });
  rerollCount.textContent = rerollsLeft;
  rerollBtn.disabled = rerollsLeft <= 0;
}

function openLevelModal(){
  modalOpen = true;
  rerollsLeft = 2;
  currentOffers = pickOffers();
  renderOffers();
  levelModal.classList.add('on');
}

function chooseSkill(id){
  player.skills[id] = (player.skills[id] || 0) + 1;
  recomputeStats();
  renderSkillsHud();
  levelModal.classList.remove('on');
  modalOpen = false;
  pendingLevelUps = Math.max(0, pendingLevelUps - 1);
  if (pendingLevelUps > 0) setTimeout(openLevelModal, 250);
}

rerollBtn.addEventListener('click', () => {
  if (rerollsLeft <= 0) return;
  rerollsLeft -= 1;
  currentOffers = pickOffers();
  renderOffers();
});

// ---------- HUD ----------
function updateHud(){
  document.getElementById('hudLevel').textContent = player.level;
  document.getElementById('hpFill').style.width = `${Math.max(0, player.hp / player.hpMax) * 100}%`;
  document.getElementById('hpText').textContent = `${Math.ceil(player.hp)}/${player.hpMax}`;
  document.getElementById('xpFill').style.width = `${(player.xp / player.xpMax) * 100}%`;
  document.getElementById('xpText').textContent = `${player.xp}/${player.xpMax}`;
  document.getElementById('statStr').textContent = player.str;
  document.getElementById('statDef').textContent = player.def;
  document.getElementById('gold').textContent = player.gold;
  document.getElementById('weaponName').textContent = WEAPONS[player.weaponKey].name;
}

function renderSkillsHud(){
  const block = document.getElementById('skillsBlock');
  block.innerHTML = '<div class="loot-title">Skills</div>';
  Object.entries(player.skills).forEach(([id, lvl]) => {
    const skill = SKILL_POOL.find(s => s.id === id);
    if (!skill) return;
    const line = document.createElement('div');
    line.className = 'skill-item';
    line.textContent = `${skill.name} · Nível ${lvl}`;
    block.appendChild(line);
  });
}

function logLoot(text){
  const log = document.getElementById('lootLog');
  const item = document.createElement('div');
  item.className = 'loot-item';
  item.textContent = text;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

recomputeStats();
updateHud();
