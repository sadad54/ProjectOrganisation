/* Shared screenshot-carousel behaviour for `.shot[data-shots]` elements —
   used by both the homepage (via siteScript.js) and /work/[slug] pages
   (via ProjectPage.jsx). Extracted 1:1 from siteScript.js §13 so there is
   one implementation, not two copies that can drift. */
export function initShotCarousels(root) {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scope = root || document;
  const disposers = [];

  scope.querySelectorAll('.shot[data-shots]').forEach(function (shot) {
    if (shot.__carouselInited) return;
    shot.__carouselInited = true;

    let shots;
    try {
      shots = JSON.parse(shot.dataset.shots);
    } catch (e) {
      return;
    }
    if (!Array.isArray(shots) || shots.length < 2) return;

    const img = shot.querySelector('img');
    const dotsWrap = shot.querySelector('[data-shot-dots]');
    const prevBtn = shot.querySelector('[data-shot-prev]');
    const nextBtn = shot.querySelector('[data-shot-next]');
    const baseAlt = img.alt;

    let i = 0,
      transitioning = false,
      visible = false,
      hovered = false;
    const dots = shots.map(function (_, idx) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show screenshot ' + (idx + 1) + ' of ' + shots.length);
      b.addEventListener('click', function () {
        go(idx);
      });
      dotsWrap.appendChild(b);
      return b;
    });

    function paintDots() {
      dots.forEach(function (d, idx) {
        d.classList.toggle('on', idx === i);
      });
      img.alt = baseAlt + ' (' + (i + 1) + ' of ' + shots.length + ')';
    }
    paintDots();

    function go(next) {
      if (transitioning || next === i) return;
      transitioning = true;
      img.classList.add('is-out');
      setTimeout(
        function () {
          i = next;
          img.src = shots[i];
          paintDots();
          img.classList.remove('is-out');
          img.classList.remove('is-in');
          void img.offsetWidth;
          img.classList.add('is-in');
          setTimeout(
            function () {
              img.classList.remove('is-in');
              transitioning = false;
            },
            RM ? 0 : 620
          );
        },
        RM ? 0 : 320
      );
    }
    function step(dir) {
      go((i + dir + shots.length) % shots.length);
    }

    if (prevBtn)
      prevBtn.addEventListener('click', function () {
        step(-1);
        restartAutoplay();
      });
    if (nextBtn)
      nextBtn.addEventListener('click', function () {
        step(1);
        restartAutoplay();
      });

    let sx = 0,
      sy = 0;
    shot.addEventListener(
      'touchstart',
      function (e) {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      },
      { passive: true }
    );
    shot.addEventListener(
      'touchend',
      function (e) {
        const dx = e.changedTouches[0].clientX - sx,
          dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          step(dx < 0 ? 1 : -1);
          restartAutoplay();
        }
      },
      { passive: true }
    );

    shot.addEventListener('pointerenter', function () {
      hovered = true;
    });
    shot.addEventListener('pointerleave', function () {
      hovered = false;
    });
    shot.addEventListener('focusin', function () {
      hovered = true;
    });
    shot.addEventListener('focusout', function () {
      hovered = false;
    });

    let timer = null;
    function tick() {
      if (visible && !hovered && !RM) step(1);
    }
    function startAutoplay() {
      if (timer || RM) return;
      timer = setInterval(tick, 4200);
    }
    function stopAutoplay() {
      clearInterval(timer);
      timer = null;
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    const io = new IntersectionObserver(
      function (es) {
        visible = es[0].isIntersecting;
        if (visible) startAutoplay();
        else stopAutoplay();
      },
      { threshold: 0.35 }
    );
    io.observe(shot);

    disposers.push(function dispose() {
      io.disconnect();
      stopAutoplay();
    });
  });

  return function disposeAll() {
    disposers.forEach(function (dispose) {
      dispose();
    });
  };
}
