import { FRANCHISES } from '../data/franchises';

interface CalEvent {
  month: string;
  day: number;
  type: string;
  badge: 'premiere' | 'episode' | 'reunion' | 'special' | 'announcement';
  title: string;
  franchise: string;
}

const EVENTS: CalEvent[] = [
  { month: 'JUL', day: 8, type: 'Episode', badge: 'episode', title: 'RHONY — New Episode', franchise: 'The Real Housewives of New York City' },
  { month: 'JUL', day: 10, type: 'Premiere', badge: 'premiere', title: 'RHOA Season 17 Premiere', franchise: 'The Real Housewives of Atlanta' },
  { month: 'JUL', day: 15, type: 'Episode', badge: 'episode', title: 'RHOBH — New Episode', franchise: 'The Real Housewives of Beverly Hills' },
  { month: 'JUL', day: 22, type: 'Premiere', badge: 'premiere', title: 'RHOSLC Season 8 Premiere', franchise: 'The Real Housewives of Salt Lake City' },
  { month: 'JUL', day: 28, type: 'Special', badge: 'special', title: 'RHUGT 20th Anniversary — Announcement', franchise: 'Real Housewives Ultimate Girls Trip' },
  { month: 'AUG', day: 5, type: 'Premiere', badge: 'premiere', title: 'RHOM Season 8 Premiere', franchise: 'The Real Housewives of Miami' },
  { month: 'AUG', day: 11, type: 'Reunion', badge: 'reunion', title: 'RHOBH Season 15 Reunion — Part 1', franchise: 'The Real Housewives of Beverly Hills' },
  { month: 'AUG', day: 18, type: 'Reunion', badge: 'reunion', title: 'RHOBH Season 15 Reunion — Part 2', franchise: 'The Real Housewives of Beverly Hills' },
  { month: 'SEP', day: 2, type: 'Announcement', badge: 'announcement', title: 'RHOP Season 12 Cast Announcement', franchise: 'The Real Housewives of Potomac' },
  { month: 'SEP', day: 9, type: 'Premiere', badge: 'premiere', title: 'RHONJ Season 16 Premiere', franchise: 'The Real Housewives of New Jersey' },
  { month: 'SEP', day: 16, type: 'Episode', badge: 'episode', title: 'RHOC — Season Finale', franchise: 'The Real Housewives of Orange County' },
  { month: 'OCT', day: 1, type: 'Premiere', badge: 'premiere', title: 'RHOP Season 12 Premiere', franchise: 'The Real Housewives of Potomac' },
  { month: 'OCT', day: 15, type: 'Special', badge: 'special', title: 'THL Season 1 Draft — Opening', franchise: 'The Housewives League' },
  { month: 'NOV', day: 3, type: 'Reunion', badge: 'reunion', title: 'RHOA Season 17 Reunion', franchise: 'The Real Housewives of Atlanta' },
];

export function initCalendar() {
  const activeCount = FRANCHISES.filter(f => f.status === 'active').length;
  const el = document.getElementById('cal-active-count');
  if (el) el.textContent = String(activeCount);

  const eventsEl = document.getElementById('cal-events');
  if (!eventsEl) return;

  eventsEl.innerHTML = EVENTS.map(ev => `
    <div class="cal-event">
      <div class="ce-date">
        <div class="ce-month">${ev.month}</div>
        <div class="ce-day">${ev.day}</div>
      </div>
      <div class="ce-body">
        <div class="ce-type">${ev.type}</div>
        <div class="ce-title">
          ${ev.title}
          <span class="ce-badge ${ev.badge}">${ev.badge}</span>
        </div>
        <div class="ce-franchise">${ev.franchise}</div>
      </div>
    </div>
  `).join('');
}
