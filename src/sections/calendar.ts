import { FRANCHISES } from '../data/franchises';

interface CalEvent {
  month: string;
  day: number;
  type: string;
  badge: 'premiere' | 'episode' | 'reunion' | 'special' | 'announcement';
  title: string;
  franchise: string;
  note?: string;
}

// Current as of July 2026. RHOM is on hiatus — not listed.
const EVENTS: CalEvent[] = [
  {
    month: 'JUL', day: 8, type: 'Episode', badge: 'episode',
    title: 'RHONY Season 17 — New Episode',
    franchise: 'The Real Housewives of New York City',
  },
  {
    month: 'JUL', day: 10, type: 'Premiere', badge: 'premiere',
    title: 'RHOA Season 17 Premiere',
    franchise: 'The Real Housewives of Atlanta',
    note: 'Season 17 · Bravo',
  },
  {
    month: 'JUL', day: 15, type: 'Episode', badge: 'episode',
    title: 'RHOBH Season 15 — New Episode',
    franchise: 'The Real Housewives of Beverly Hills',
  },
  {
    month: 'JUL', day: 22, type: 'Premiere', badge: 'premiere',
    title: 'RHOC Season 20 Premiere',
    franchise: 'The Real Housewives of Orange County',
    note: 'The OG franchise turns 20',
  },
  {
    month: 'JUL', day: 28, type: 'Special', badge: 'special',
    title: 'RHUGT — 20th Anniversary Special Announcement',
    franchise: 'Real Housewives Ultimate Girls Trip',
  },
  {
    month: 'AUG', day: 5, type: 'Announcement', badge: 'announcement',
    title: 'RHOSLC Season 6 Cast Announcement',
    franchise: 'The Real Housewives of Salt Lake City',
  },
  {
    month: 'AUG', day: 12, type: 'Reunion', badge: 'reunion',
    title: 'RHOBH Season 15 Reunion — Part 1',
    franchise: 'The Real Housewives of Beverly Hills',
  },
  {
    month: 'AUG', day: 19, type: 'Reunion', badge: 'reunion',
    title: 'RHOBH Season 15 Reunion — Part 2',
    franchise: 'The Real Housewives of Beverly Hills',
  },
  {
    month: 'AUG', day: 26, type: 'Reunion', badge: 'reunion',
    title: 'RHOA Season 17 Reunion',
    franchise: 'The Real Housewives of Atlanta',
  },
  {
    month: 'SEP', day: 9, type: 'Premiere', badge: 'premiere',
    title: 'RHONJ Season 16 Premiere',
    franchise: 'The Real Housewives of New Jersey',
    note: 'Post-Gorga era begins',
  },
  {
    month: 'SEP', day: 16, type: 'Premiere', badge: 'premiere',
    title: 'RHOSLC Season 6 Premiere',
    franchise: 'The Real Housewives of Salt Lake City',
  },
  {
    month: 'SEP', day: 23, type: 'Announcement', badge: 'announcement',
    title: 'RHOP Season 11 Cast Announcement',
    franchise: 'The Real Housewives of Potomac',
  },
  {
    month: 'OCT', day: 1, type: 'Special', badge: 'special',
    title: 'THL Season 1 Draft — Opening Day',
    franchise: 'The Housewives League',
    note: 'Fantasy season begins',
  },
  {
    month: 'OCT', day: 14, type: 'Premiere', badge: 'premiere',
    title: 'RHOP Season 11 Premiere',
    franchise: 'The Real Housewives of Potomac',
  },
  {
    month: 'NOV', day: 3, type: 'Reunion', badge: 'reunion',
    title: 'RHONJ Season 16 Reunion — Part 1',
    franchise: 'The Real Housewives of New Jersey',
  },
  {
    month: 'NOV', day: 11, type: 'Premiere', badge: 'premiere',
    title: 'RHO London Season 2 Premiere',
    franchise: 'The Real Housewives of London',
    note: 'Peacock international',
  },
  {
    month: 'DEC', day: 2, type: 'Special', badge: 'special',
    title: 'THL Season 1 — Mid-Season Rankings',
    franchise: 'The Housewives League',
    note: 'Community vote results',
  },
];

export function initCalendar() {
  const activeCount = FRANCHISES.filter(f => f.status === 'active').length;
  const el = document.getElementById('cal-active-count');
  if (el) el.textContent = String(activeCount);

  const eventsEl = document.getElementById('cal-events');
  if (!eventsEl) return;

  const today = new Date();
  const MONTH_IDX: Record<string, number> = {
    JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,
    JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11,
  };

  eventsEl.innerHTML = EVENTS.map(ev => {
    const evDate = new Date(today.getFullYear(), MONTH_IDX[ev.month], ev.day);
    const isPast = evDate < today;
    return `
      <div class="cal-event${isPast ? ' cal-past' : ''}">
        <div class="ce-date">
          <div class="ce-month">${ev.month}</div>
          <div class="ce-day">${ev.day}</div>
        </div>
        <div class="ce-body">
          <div class="ce-type">${ev.type}${isPast ? ' · Past' : ''}</div>
          <div class="ce-title">
            ${ev.title}
            <span class="ce-badge ${ev.badge}">${ev.type}</span>
          </div>
          <div class="ce-franchise">${ev.franchise}${ev.note ? ` · <em style="color:var(--muted);font-style:italic">${ev.note}</em>` : ''}</div>
        </div>
      </div>`;
  }).join('');
}
