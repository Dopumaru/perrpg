const EnvironmentFX = (() => {
  let canvas, ctx, width = 0, height = 0, particles = [], lastZone = null;
  let audio = null, audioEnabled = false;
  const zones = {
    'Vila Pacífica': { particle: 'dust', count: 16 },
    'Floresta Sombria': { particle: 'firefly', count: 28 },
    'Pântano Amaldiçoado': { particle: 'bubble', count: 22 },
    'Covil Esquecido': { particle: 'ash', count: 30 }
  };

  function setup(){
    canvas = document.createElement('canvas');
    canvas.id = 'environment-fx';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    addEventListener('resize', resize);
    createAudioToggle();
    requestAnimationFrame(loop);
  }

  function resize(){
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function zoneConfig(){
    const chip = document.getElementById('zoneChip');
    const name = chip?.querySelector('.z-name')?.textContent || 'Vila Pacífica';
    return { name, ...(zones[name] || zones['Vila Pacífica']) };
  }

  function resetParticles(config){
    particles = Array.from({length: config.count}, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .18, vy: -(Math.random() * .18 + .03),
      size: Math.random() * 2.4 + 1, life: Math.random(), phase: Math.random() * 7
    }));
  }

  function updateParticles(dt){
    for (const p of particles){
      p.life += dt * .035;
      p.x += p.vx + Math.sin(performance.now() * .0005 + p.phase) * .08;
      p.y += p.vy;
      if (p.y < -20 || p.life > 1){ p.y = height + 12; p.x = Math.random() * width; p.life = 0; }
    }
  }

  function drawParticles(config){
    ctx.clearRect(0, 0, width, height);
    for (const p of particles){
      const alpha = Math.max(0, .55 * (1 - p.life));
      ctx.fillStyle = config.particle === 'firefly'
        ? `rgba(135,220,155,${alpha})`
        : config.particle === 'bubble'
          ? `rgba(205,221,122,${alpha * .7})`
          : config.particle === 'ash'
            ? `rgba(225,150,165,${alpha * .45})`
            : `rgba(220,205,150,${alpha * .35})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initAudio(){
    if (audio) return;
    audio = new (window.AudioContext || window.webkitAudioContext)();
    const master = audio.createGain(); master.gain.value = .035; master.connect(audio.destination);
    const osc = audio.createOscillator(); const gain = audio.createGain();
    osc.type = 'sine'; osc.frequency.value = 110; gain.gain.value = 0; osc.connect(gain).connect(master); osc.start();
    audio.ambient = { osc, gain, master };
  }

  function updateAmbientSound(config){
    if (!audioEnabled) return;
    initAudio();
    const freq = config.particle === 'bubble' ? 78 : config.particle === 'ash' ? 58 : config.particle === 'firefly' ? 130 : 96;
    const now = audio.currentTime;
    audio.ambient.osc.frequency.setTargetAtTime(freq, now, .8);
    audio.ambient.gain.gain.setTargetAtTime(.045, now, 1.2);
  }

  function playTransition(){
    if (!audioEnabled) return;
    initAudio();
    const now = audio.currentTime;
    const osc = audio.createOscillator(); const gain = audio.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(240, now); osc.frequency.exponentialRampToValueAtTime(520, now + .35);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.08, now + .03); gain.gain.exponentialRampToValueAtTime(.0001, now + .45);
    osc.connect(gain).connect(audio.ambient.master); osc.start(now); osc.stop(now + .5);
  }

  function createAudioToggle(){
    const button = document.createElement('button');
    button.id = 'environment-audio-toggle'; button.type = 'button'; button.textContent = 'Som: desligado';
    button.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      button.textContent = audioEnabled ? 'Som: ligado' : 'Som: desligado';
      if (audioEnabled){ initAudio(); audio.resume(); updateAmbientSound(zoneConfig()); }
      else if (audio?.ambient) audio.ambient.gain.gain.setTargetAtTime(0, audio.currentTime, .3);
    });
    document.body.appendChild(button);
  }

  function loop(now){
    const config = zoneConfig();
    if (config.name !== lastZone){ lastZone = config.name; resetParticles(config); updateAmbientSound(config); playTransition(); }
    updateParticles(1 / 60); drawParticles(config); requestAnimationFrame(loop);
  }

  return { setup };
})();

window.addEventListener('load', () => EnvironmentFX.setup());
