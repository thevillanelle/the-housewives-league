import { initGlobe } from './globe';
import { initSidebar } from './sidebar';
import { initTicker } from './ticker';
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

async function boot() {
  setProgress(10, MESSAGES[0]);
  await delay(200);

  setProgress(35, MESSAGES[1]);
  initTicker();
  await delay(200);

  setProgress(60, MESSAGES[2]);
  initSidebar();
  await delay(200);

  setProgress(85, MESSAGES[3]);
  initGlobe();
  await delay(300);

  setProgress(100, MESSAGES[4]);
  await delay(400);

  // Update franchise count
  const countEl = document.getElementById('count-num');
  if (countEl) countEl.textContent = String(FRANCHISES.length);

  // Fade out splash
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('out');
    setTimeout(() => { splash.style.display = 'none'; }, 800);
  }
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

boot();
