export function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle || toggle.dataset.bound === '1') return;
  toggle.dataset.bound = '1';

  function applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggle.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  });
}
