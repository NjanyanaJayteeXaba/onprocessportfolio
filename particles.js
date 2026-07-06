/* ============================================================
   JAYTEE XABA — Enhanced Persistent Particle Background
   Visible on all pages, glows through semi-transparent divs
   Mouse interaction: attract nearby particles
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  const COUNT    = 110;
  const MAX_DIST = 150;
  const MOUSE_RADIUS = 120;
  const particles = [];

  function rand(a, b) { return Math.random() * (b - a) + a; }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:     rand(0, W),
      y:     rand(0, H),
      ox:    0, oy: 0,
      vx:    rand(-0.22, 0.22),
      vy:    rand(-0.22, 0.22),
      r:     rand(1.5, 3.2),
      alpha: rand(0.3, 0.7),
      pulse: rand(0, Math.PI * 2)
    });
  }

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Mouse repel/attract */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        p.x += (dx / dist) * force * 1.4;
        p.y += (dy / dist) * force * 1.4;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* Pulsing alpha */
      p.pulse += 0.012;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,147,255,${a})`;
      ctx.shadowColor = 'rgba(20,147,255,0.6)';
      ctx.shadowBlur  = 6;
      ctx.fill();
      ctx.shadowBlur  = 0;

      /* Connection lines */
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const lx = p.x - q.x;
        const ly = p.y - q.y;
        const ld = Math.sqrt(lx * lx + ly * ly);
        if (ld < MAX_DIST) {
          const opacity = 0.20 * (1 - ld / MAX_DIST);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(20,147,255,${opacity})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();

  /* ---- Cursor Trail ---- */
  const trail = [];
  const TRAIL_LEN = 18;

  document.addEventListener('mousemove', e => {
    trail.push({ x: e.clientX, y: e.clientY, life: 1.0 });
    if (trail.length > TRAIL_LEN) trail.shift();
  });

  (function trailLoop() {
    const trailCanvas = document.getElementById('trail-canvas');
    if (!trailCanvas) { requestAnimationFrame(trailLoop); return; }
    const tc = trailCanvas.getContext('2d');

    function drawTrail() {
      tc.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const ratio = i / trail.length;
        tc.beginPath();
        tc.arc(t.x, t.y, ratio * 4, 0, Math.PI * 2);
        tc.fillStyle = `rgba(20,147,255,${ratio * 0.55})`;
        tc.fill();
        t.life -= 0.05;
      }
      requestAnimationFrame(drawTrail);
    }
    drawTrail();
  })();

})();
