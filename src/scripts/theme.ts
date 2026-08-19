export function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  const logoLight = document.getElementById('logo-light');
  const logoDark = document.getElementById('logo-dark');

  function applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    iconSun?.classList.toggle('hidden', isDark);
    iconMoon?.classList.toggle('hidden', !isDark);
    logoLight?.classList.toggle('hidden', isDark);
    logoDark?.classList.toggle('hidden', !isDark);
  }

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark || true);

  toggle?.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  });
}

initTheme();
