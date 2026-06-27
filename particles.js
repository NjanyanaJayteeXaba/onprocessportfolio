/* Shared persistent particle background — draws on #bg-canvas */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT    = 70;
  const MAX_DIST = 140;
  const particles = [];

  function rand(a, b) { return Math.random() * (b - a) + a; }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:     rand(0, window.innerWidth),
      y:     rand(0, window.innerHeight),
      vx:    rand(-0.25, 0.25),
      vy:    rand(-0.25, 0.25),
      r:     rand(1.5, 3),
      alpha: rand(0.15, 0.5)
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Connection lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(20,147,255,${0.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    /* Dots */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,147,255,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
})();
