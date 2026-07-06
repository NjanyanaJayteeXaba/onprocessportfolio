/* ============================================================
   JAYTEE XABA — Live Bot Face Widget
   
   Injected on every page via this script
   ============================================================ */
(function () {
  /* ---- Inject bot face HTML into .chat-bubble ---- */
  const bubble = document.getElementById('chat-bubble');
  if (!bubble) return;

  bubble.innerHTML = `
    <svg class="bot-face-svg" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
      <!-- Antenna -->
      <line x1="29" y1="6" x2="29" y2="13" stroke="#1493ff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="29" cy="4.5" r="3" fill="#1493ff" class="bot-antenna-glow"/>

      <!-- Head -->
      <rect x="8" y="13" width="42" height="34" rx="10" ry="10"
        fill="rgba(0,0,0,0.85)" stroke="#1493ff" stroke-width="1.8"/>

      <!-- Left Eye -->
      <g class="bot-eye-left">
        <ellipse cx="20" cy="27" rx="5" ry="6" fill="#1493ff" opacity="0.15"/>
        <ellipse cx="20" cy="27" rx="4" ry="4.5" fill="#1493ff" class="eye-inner"/>
        <ellipse cx="20" cy="27" rx="2" ry="2.2" fill="#000"/>
        <circle  cx="21.5" cy="25.5" r="1" fill="#fff" opacity="0.9"/>
      </g>

      <!-- Right Eye -->
      <g class="bot-eye-right">
        <ellipse cx="38" cy="27" rx="5" ry="6" fill="#1493ff" opacity="0.15"/>
        <ellipse cx="38" cy="27" rx="4" ry="4.5" fill="#1493ff" class="eye-inner"/>
        <ellipse cx="38" cy="27" rx="2" ry="2.2" fill="#000"/>
        <circle  cx="39.5" cy="25.5" r="1" fill="#fff" opacity="0.9"/>
      </g>

      <!-- Mouth (subtle smile) -->
      <path class="bot-mouth" d="M 21 38 Q 29 43 37 38" stroke="#1493ff" stroke-width="1.8"
        fill="none" stroke-linecap="round"/>

      <!-- Cheek blush left -->
      <ellipse cx="12" cy="33" rx="3" ry="2" fill="#1493ff" opacity="0.18"/>
      <!-- Cheek blush right -->
      <ellipse cx="46" cy="33" rx="3" ry="2" fill="#1493ff" opacity="0.18"/>
    </svg>
  `;

  bubble.style.background = 'transparent';
  bubble.style.boxShadow  = '0 0 22px rgba(20,147,255,0.45), 0 4px 20px rgba(0,0,0,0.5)';
  bubble.style.border     = '1.5px solid rgba(20,147,255,0.5)';
  bubble.style.background = 'rgba(0,0,0,0.8)';
  bubble.style.backdropFilter = 'blur(12px)';

  /* ---- Blink animation ---- */
  const eyeLeft  = bubble.querySelector('.bot-eye-left  .eye-inner');
  const eyeRight = bubble.querySelector('.bot-eye-right .eye-inner');
  const mouth    = bubble.querySelector('.bot-mouth');

  function blink() {
    if (!eyeLeft || !eyeRight) return;
    eyeLeft.style.transform  = 'scaleY(0.1)';
    eyeRight.style.transform = 'scaleY(0.1)';
    eyeLeft.style.transformOrigin  = 'center';
    eyeRight.style.transformOrigin = 'center';
    setTimeout(() => {
      eyeLeft.style.transform  = '';
      eyeRight.style.transform = '';
    }, 140);
  }

  function wink() {
    if (!eyeLeft) return;
    eyeLeft.style.transform = 'scaleY(0.05)';
    eyeLeft.style.transformOrigin = 'center';
    setTimeout(() => { eyeLeft.style.transform = ''; }, 200);
  }

  function scheduleNextBlink() {
    const delay = 2500 + Math.random() * 3000;
    setTimeout(() => {
      if (Math.random() < 0.25) {
        wink();
      } else {
        blink();
      }
      scheduleNextBlink();
    }, delay);
  }
  scheduleNextBlink();

  /* ---- React to chat open/close ---- */
  const chatWindow = document.getElementById('chat-window');
  if (chatWindow) {
    const observer = new MutationObserver(() => {
      const isOpen = chatWindow.classList.contains('active');
      if (mouth) {
        mouth.setAttribute('d', isOpen
          ? 'M 21 37 Q 29 44.5 37 37'
          : 'M 21 38 Q 29 43 37 38'
        );
      }
    });
    observer.observe(chatWindow, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---- Hover wiggle ---- */
  bubble.addEventListener('mouseenter', () => {
    bubble.style.transform = 'scale(1.12) rotate(-6deg)';
  });
  bubble.addEventListener('mouseleave', () => {
    bubble.style.transform = '';
  });

})();
