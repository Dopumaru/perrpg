// Pixel's Realm - protótipo jogável inicial
// Movimentação top-down, combate simples, XP/nível, loot básico.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener('resize', resize);
resize();

const WORLD = { w: 1600, h: 1200, tile: 40 };

const keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key === ' ') tryAttack(); });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

const lootTable = [
  { name: 'Espada Enferrujada', rarity: 'comum', chance: 0.35 },
  { name: 'Poção de Vida', rarity: 'comum', chance: 0.3 },
  { name: 'Anel Antigo', rarity: 'raro', chance: 0.12 },
  { name: 'Adaga Élfica', rarity: 'raro', chance: 0.1 },
  { name: 'Coroa Esquecida', rarity: 'épico', chance: 0.03 },
];

function rollLoot(){
  const roll = Math.random();
  let acc = 0;
  for (const item of lootTable) {
    acc += item.chance;
    if (roll <= acc) return item;
  }
  return null;
}

const player = {
  x: WORLD.w / 2, y: WORLD.h / 2, size: 26, speed: 220,
  level: 1, xp: 0, xpMax: 20,
  hp: 30, hpMax: 30,
  str: 4, def: 2,
  gold: 0,
  attackCooldown: 0, attackRange: 46, attackDuration: 0.18, facing: 'down'
};

function xpForNextLevel(level){ return 20 + (level - 1) * 15; }

function gainXP(amount){
  player.xp += amount;
  while (player.xp >= player.xpMax) {
    player.xp -= player.xpMax;
    player.level += 1;
    player.xpMax = xpForNextLevel(player.level);
    player.hpMax += 6;
    player.hp = player.hpMax;
    player.str += 1;
    player.def += 1;
    logLoot(`Subiu para o nível ${player.level}!`);
  }
  updateHud();
}

function makeEnemy(x, y){
  return {
    x, y, size: 24, hp: 18, hpMax: 18, str: 3, speed: 70,
    xpReward: 12, goldReward: [2, 6], alive: true, hitFlash: 0,
    wanderAngle: Math.random() * Math.PI * 2, wanderTimer: 0
  };
}

let enemies = [];
for (let i = 0; i < 10; i++) {
  enemies.push(makeEnemy(
    200 + Math.random() * (WORLD.w - 400),
    200 + Math.random() * (WORLD.h - 400)
  ));
}

let camera = { x: 0, y: 0 };
let lastTime = performance.now();

function tryAttack(){
  if (player.attackCooldown > 0) return;
  player.attackCooldown = 0.45;
  player.attacking = player.attackDuration;

  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = e.x - player.x, dy = e.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= player.attackRange) {
      e.hp -= Math.max(1, player.str);
      e.hitFlash = 0.15;
      if (e.hp <= 0) {
        e.alive = false;
        gainXP(e.xpReward);
        const gold = Math.floor(e.goldReward[0] + Math.random() * (e.goldReward[1] - e.goldReward[0]));
        player.gold += gold;
        const loot = rollLoot();
        if (loot) logLoot(`+${gold} ouro · ${loot.name} (${loot.rarity})`);
        else logLoot(`+${gold} ouro`);
        updateHud();
        setTimeout(() => respawnEnemy(e), 3500);
      }
    }
  }
}

function respawnEnemy(e){
  e.alive = true;
  e.hp = e.hpMax;
  e.x = 200 + Math.random() * (WORLD.w - 400);
  e.y = 200 + Math.random() * (WORLD.h - 400);
}

function update(dt){
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len; dy /= len;
    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
    player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  player.x = Math.max(20, Math.min(WORLD.w - 20, player.x));
  player.y = Math.max(20, Math.min(WORLD.h - 20, player.y));

  if (player.attackCooldown > 0) player.attackCooldown -= dt;
  if (player.attacking > 0) player.attacking -= dt;

  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    const dx2 = player.x - e.x, dy2 = player.y - e.y;
    const dist = Math.hypot(dx2, dy2);
    if (dist < 240) {
      e.x += (dx2 / dist) * e.speed * dt;
      e.y += (dy2 / dist) * e.speed * dt;
      if (dist < e.size + player.size * 0.5) {
        player.hp -= e.str * dt * 1.4;
        if (player.hp < 0) player.hp = 0;
        updateHud();
      }
    } else {
      e.wanderTimer -= dt;
      if (e.wanderTimer <= 0) {
        e.wanderAngle = Math.random() * Math.PI * 2;
        e.wanderTimer = 1.5 + Math.random() * 1.5;
      }
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
  for (let x = startX; x < canvas.width; x += WORLD.tile) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = startY; y < canvas.height; y += WORLD.tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawPlayer(){
  const sx = player.x - camera.x, sy = player.y - camera.y;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.fillStyle = '#274a7a';
  ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
  ctx.fillStyle = '#c98f66';
  ctx.fillRect(-8, -player.size/2 - 12, 16, 14);
  if (player.attacking > 0) {
    ctx.fillStyle = 'rgba(220,230,255,0.55)';
    let ax = 0, ay = 0;
    if (player.facing === 'up') ay = -player.attackRange;
    if (player.facing === 'down') ay = player.attackRange;
    if (player.facing === 'left') ax = -player.attackRange;
    if (player.facing === 'right') ax = player.attackRange;
    ctx.beginPath();
    ctx.arc(ax * 0.5, ay * 0.5, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEnemies(){
  for (const e of enemies) {
    if (!e.alive) continue;
    const sx = e.x - camera.x, sy = e.y - camera.y;
    if (sx < -60 || sx > canvas.width + 60 || sy < -60 || sy > canvas.height + 60) continue;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#8a3838';
    ctx.fillRect(-e.size/2, -e.size/2, e.size, e.size);
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(-e.size/2, -e.size/2 - 10, e.size, 4);
    ctx.fillStyle = '#e05c5c';
    ctx.fillRect(-e.size/2, -e.size/2 - 10, e.size * (e.hp / e.hpMax), 4);
    ctx.restore();
  }
}

function draw(){
  drawGround();
  drawEnemies();
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

function updateHud(){
  document.getElementById('hudLevel').textContent = player.level;
  document.getElementById('hpFill').style.width = `${Math.max(0, player.hp / player.hpMax) * 100}%`;
  document.getElementById('hpText').textContent = `${Math.ceil(player.hp)}/${player.hpMax}`;
  document.getElementById('xpFill').style.width = `${(player.xp / player.xpMax) * 100}%`;
  document.getElementById('xpText').textContent = `${player.xp}/${player.xpMax}`;
  document.getElementById('statStr').textContent = player.str;
  document.getElementById('statDef').textContent = player.def;
  document.getElementById('gold').textContent = player.gold;
}

function logLoot(text){
  const log = document.getElementById('lootLog');
  const item = document.createElement('div');
  item.className = 'loot-item';
  item.textContent = text;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

updateHud();
