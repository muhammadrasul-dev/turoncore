export function initSpotlight() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll<HTMLElement>('.js-spot');
  if (!cards.length) return;

  cards.forEach((card) => {
    let frame = 0;

    card.addEventListener(
      'pointermove',
      (event) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--my', `${event.clientY - rect.top}px`);
          frame = 0;
        });
      },
      { passive: true }
    );
  });
}

initSpotlight();
