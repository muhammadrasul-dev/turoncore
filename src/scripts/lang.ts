function setMenuOpen(dropdown: Element, open: boolean) {
  const trigger = dropdown.querySelector('[data-lang-trigger]');
  const menu = dropdown.querySelector('[data-lang-menu]');
  const chevron = dropdown.querySelector<HTMLElement>('[data-lang-chevron]');
  if (!trigger || !menu) return;

  trigger.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('scale-95', !open);
  menu.classList.toggle('opacity-0', !open);
  menu.classList.toggle('pointer-events-none', !open);
  menu.classList.toggle('scale-100', open);
  menu.classList.toggle('opacity-100', open);
  if (chevron) chevron.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
}

function closeAllLangMenus() {
  document.querySelectorAll('[data-lang-dropdown]').forEach((dropdown) => {
    setMenuOpen(dropdown, false);
  });
}

function bindLangListeners() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest('[data-lang-trigger]');
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = trigger.closest('[data-lang-dropdown]');
      if (!dropdown) return;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllLangMenus();
      if (!isOpen) setMenuOpen(dropdown, true);
      return;
    }

    if (!target.closest('[data-lang-dropdown]')) {
      closeAllLangMenus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllLangMenus();
  });
}

export function initLangSwitchers() {
  bindLangListeners();
}
