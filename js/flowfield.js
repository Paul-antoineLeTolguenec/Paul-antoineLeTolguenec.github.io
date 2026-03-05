// Flow field — Perlin noise particle system with mouse interaction
(function () {
  const canvas = document.getElementById('flowfield');
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };
  const N = 500;
  const SPEED = 1.8;
  const MOUSE_RADIUS = 180;
  const MOUSE_STRENGTH = 0.04;
  const TRAIL = 0.13; // higher = shorter trails

  // ── Simple smooth noise (based on gradient vectors) ──────────────────────
  const perm = new Uint8Array(512);
  (function seedPerm() {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 3;
    return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
  }

  function noise2D(x, y) {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  }

  // ── Particle ─────────────────────────────────────────────────────────────
  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0, vy: 0,
      life: Math.random(),          // 0..1 phase offset
      maxLife: 0.6 + Math.random() * 0.4,
      size: 0.6 + Math.random() * 1.2,
    };
  }

  function resetParticle(p) {
    p.x = Math.random() * W;
    p.y = Math.random() * H;
    p.vx = 0; p.vy = 0;
    p.life = 0;
    p.maxLife = 0.6 + Math.random() * 0.4;
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    resize();
    particles = Array.from({ length: N }, createParticle);
  }

  // ── Draw loop ─────────────────────────────────────────────────────────────
  let t = 0;

  function draw() {
    // Fade background → creates trails
    ctx.fillStyle = `rgba(7, 11, 20, ${TRAIL})`;
    ctx.fillRect(0, 0, W, H);

    t += 0.0005;
    const scale = 0.0035;

    for (const p of particles) {
      // Flow angle from Perlin noise
      const angle = noise2D(p.x * scale + t, p.y * scale + t * 0.7) * Math.PI * 4;

      // Target velocity from field
      const tx = Math.cos(angle) * SPEED;
      const ty = Math.sin(angle) * SPEED;

      // Mouse interaction: attraction inside radius
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          const d = Math.sqrt(d2);
          const force = (1 - d / MOUSE_RADIUS) * MOUSE_STRENGTH;
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }

      // Smooth velocity towards field
      p.vx += (tx - p.vx) * 0.08;
      p.vy += (ty - p.vy) * 0.08;

      p.x += p.vx;
      p.y += p.vy;

      // Life cycle
      p.life += 0.004;
      if (p.life > p.maxLife || p.x < -5 || p.x > W + 5 || p.y < -5 || p.y > H + 5) {
        resetParticle(p);
        continue;
      }

      // Alpha: ramp in / ramp out
      const phase = p.life / p.maxLife;
      const alpha = Math.sin(phase * Math.PI) * 0.75;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  // ── Events ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  // ── Start ─────────────────────────────────────────────────────────────────
  init();
  draw();
})();
