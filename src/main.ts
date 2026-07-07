import { initGlobe } from './globe';
import { initSidebar } from './sidebar';
import { initTicker } from './ticker';
import { initNav } from './nav';
import { initUniverse } from './sections/universe';
import { initPlayers } from './sections/players';
import { initFantasy } from './sections/fantasy';
import { initCalendar } from './sections/calendar';
import { initNetwork } from './sections/network';
import { FRANCHISES } from './data/franchises';

const MESSAGES = [
  'Initializing universe…',
  'Mapping global franchises…',
  'Loading the Housewives database…',
  'Calibrating the globe…',
  'Ready to draft…',
];

function setProgress(pct: number, msg: string) {
  const fill = document.getElementById('sp-fill');
  const msgEl = document.getElementById('sp-msg');
  if (fill) fill.style.width = `${pct}%`;
  if (msgEl) msgEl.textContent = msg;
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function boot() {
  setProgress(10, MESSAGES[0]);
  await delay(180);

  setProgress(30, MESSAGES[1]);
  initNav();
  initTicker();
  await delay(150);

  setProgress(55, MESSAGES[2]);
  initSidebar();
  initUniverse();
  initPlayers();
  initFantasy();
  initCalendar();
  // network is lazy — initialized on first Universe visit
  document.addEventListener('thl:navigate', (e: Event) => {
    if ((e as CustomEvent).detail === 'universe') initNetwork('network-viz');
  });
  await delay(150);

  setProgress(80, MESSAGES[3]);
  initGlobe();
  await delay(320);

  setProgress(100, MESSAGES[4]);
  await delay(380);

  const countEl = document.getElementById('count-num');
  if (countEl) countEl.textContent = String(FRANCHISES.length);

  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('out');
    setTimeout(() => { splash.style.display = 'none'; }, 800);
  }
}

boot();
