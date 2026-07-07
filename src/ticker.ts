const ITEMS = [
  { text: 'THE HOUSEWIVES LEAGUE', cls: 'accent' },
  { text: '·', cls: 'sep' },
  { text: 'The global fantasy sports layer for reality television', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'RHOC', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHONY', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOA', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHONJ', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOBH', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOM', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOP', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOSLC', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHODubai', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOM AU', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOJ', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOL', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOCH', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOSP', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'RHOS SG', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Watch the world', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'Draft the legends', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'Build the dynasty', cls: 'accent' },
  { text: '·', cls: 'sep' },
  { text: '25 Franchises · 7 Regions · 1 Universe', cls: '' },
  { text: '·', cls: 'sep' },
];

export function initTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;

  // Double the items so the seamless loop works
  const allItems = [...ITEMS, ...ITEMS];

  inner.innerHTML = allItems
    .map(item =>
      item.cls === 'sep'
        ? `<span class="ticker-sep">${item.text}</span>`
        : `<span class="ticker-item${item.cls ? ' ' + item.cls : ''}">${item.text}</span>`
    )
    .join('');
}
