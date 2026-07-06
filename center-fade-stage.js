// Center-fade scrollytelling controller — crossfade edition
    (function () {
      if (window.__centerFadeStageReady) return;
      window.__centerFadeStageReady = true;

      const sections = Array.from(document.querySelectorAll('.article-section'));
      let ticking = false;
      let currentActive = null;
      const FADE_MS = 750; // 與CSS transition同步

      function wrapNormalSections() {
        sections.forEach((section) => {
          if (section.classList.contains('chart-scroll-scene')) return;
          if (section.querySelector(':scope > .stage-content')) return;

          const wrapper = document.createElement('div');
          wrapper.className = 'stage-content';

          while (section.firstChild) {
            wrapper.appendChild(section.firstChild);
          }

          section.appendChild(wrapper);
        });
      }

      function chooseActiveSection() {
        const visibleSections = sections.filter((section) => {
          if (section.hidden) return false;
          if (section.classList.contains('spotify-episode-inactive')) return false;
          const style = window.getComputedStyle ? window.getComputedStyle(section) : null;
          if (style && style.display === 'none') return false;
          return true;
        });

        if (!visibleSections.length) return null;

        const focusLine = window.innerHeight * 0.52;
        let active = visibleSections[0];
        let bestDistance = Number.POSITIVE_INFINITY;

        visibleSections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          let distance;

          if (rect.top <= focusLine && rect.bottom >= focusLine) {
            distance = Math.abs(center - focusLine) * 0.001;
          } else {
            distance = Math.abs(center - focusLine);
          }

          if (distance < bestDistance) {
            bestDistance = distance;
            active = section;
          }
        });

        return active;
      }

      function updateActiveSection() {
        const active = chooseActiveSection();
        if (!active || active === currentActive) return;

        const prev = currentActive;
        currentActive = active;

        // 新頁：立刻加is-center-active（開始淡入）
        active.classList.add('is-center-active');
        active.classList.add('is-visible');
        active.classList.remove('is-leaving');

        // 舊頁：移除is-center-active，加is-leaving（保持可見並淡出）
        if (prev) {
          prev.classList.remove('is-center-active');
          prev.classList.remove('is-visible');
          prev.classList.add('is-leaving');

          // 過渡完成後清除is-leaving
          clearTimeout(prev._leaveTimer);
          prev._leaveTimer = setTimeout(() => {
            prev.classList.remove('is-leaving');
          }, FADE_MS + 50);
        }

        // 其他所有section確保乾淨
        sections.forEach((section) => {
          if (section === active || section === prev) return;
          section.classList.remove('is-center-active', 'is-visible', 'is-leaving');
        });

        document.body.classList.add('center-stage-ready');
      }

      function requestUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
      }

      function init() {
        wrapNormalSections();
        updateActiveSection();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
    })();
