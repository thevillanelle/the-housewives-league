export type Section = 'globe' | 'universe' | 'players' | 'fantasy' | 'calendar';

let current: Section = 'globe';

export function initNav() {
  document.querySelectorAll<HTMLButtonElement>('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.section as Section);
    });
  });
}

export function navigateTo(section: Section) {
  current = section;

  document.querySelectorAll<HTMLElement>('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  document.querySelectorAll<HTMLElement>('.section-panel').forEach(panel => {
    panel.classList.toggle('visible', panel.id === `section-${section}`);
  });

  document.querySelectorAll<HTMLElement>('.globe-ui').forEach(el => {
    el.classList.toggle('hidden', section !== 'globe');
  });

  if (section !== 'globe') {
    document.getElementById('sidebar')?.classList.remove('open');
  }

  document.dispatchEvent(new CustomEvent('thl:navigate', { detail: section }));
}

export function getCurrentSection() {
  return current;
}
