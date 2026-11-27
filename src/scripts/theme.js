// Theme: the visitor's saved choice from the switch in the header, else the
// system setting. BaseLayout inlines this file in <head> (and adds its hash to
// the CSP), so it runs before the first paint and a saved choice never flashes
// the other theme.
(() => {
  const root = document.documentElement;
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const colorScheme = document.querySelector('meta[name="color-scheme"]');
  const themeColors = [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) => ({
    meta,
    color: meta.content,
    dark: (meta.getAttribute('media') ?? '').includes('dark'),
  }));

  const system = () => (systemDark.matches ? 'dark' : 'light');
  const saved = () => {
    try {
      const value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null; // Storage is blocked: follow the system.
    }
  };
  const save = (value) => {
    try {
      if (value) localStorage.setItem('theme', value);
      else localStorage.removeItem('theme');
    } catch {
      // Storage is blocked: the choice lasts for this page only.
    }
  };

  let choice = saved();

  const apply = () => {
    const theme = choice ?? system();
    root.dataset.theme = theme;
    // Browser UI colors follow an explicit choice too.
    if (colorScheme) colorScheme.content = choice ?? 'light dark';
    const forced = choice && themeColors.find((entry) => entry.dark === (choice === 'dark'));
    for (const entry of themeColors) entry.meta.content = forced ? forced.color : entry.color;
    for (const button of document.querySelectorAll('[data-theme-switch]')) {
      button.setAttribute('aria-checked', String(theme === 'dark'));
    }
  };
  const reload = () => {
    choice = saved();
    apply();
  };

  apply();
  systemDark.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', apply);
  // Another tab changed the theme, or this page came back from the back/forward cache.
  addEventListener('storage', (event) => event.key === 'theme' && reload());
  addEventListener('pageshow', (event) => event.persisted && reload());

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('[data-theme-switch]')) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    // Picking what the system already shows means "follow the system" again.
    choice = next === system() ? null : next;
    save(choice);
    apply();
  });
})();
