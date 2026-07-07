import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { roster } from './fantasy';

// ── Simulated opponent teams ───────────────────────────────────────────────

interface OpponentTeam {
  id: string;
  name: string;
  color: string;
  roster: string[];
}

interface TradeOffer {
  id: string;
  fromTeam: string;
  myOffer: string;
  theirOffer: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

const TEAM_NAMES = [
  'Potomac Royals', 'Atlanta Peach Cartel', 'Salt Lake Saints',
  'NYC Empire', 'BH Diamonds', 'OC Legends',
];

const TEAM_COLORS = ['#4a7fc1','#5c9e6e','#c9a84c','#b5426a','#9c6fc1','#d4813a'];

let opponents: OpponentTeam[] = [];
let selectedOpponent: string | null = null;
let pendingTrades: TradeOffer[] = [];
let myOfferPick: string = '';
let theirOfferPick: string = '';

function getFranchiseAbbr(id: string) {
  return FRANCHISES.find(f => f.id === id)?.abbr ?? id.toUpperCase();
}

function getFranchiseColor(id: string) {
  return FRANCHISES.find(f => f.id === id)?.color ?? '#7a5c68';
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function buildOpponents() {
  if (opponents.length > 0) return;

  const allIds = HOUSEWIVES.map(h => h.id);
  const userRoster = Array.from(roster);

  const shuffled = [...allIds].sort(() => Math.random() - 0.5);
  const pool = shuffled.filter(id => !userRoster.includes(id));

  opponents = TEAM_NAMES.slice(0, 3).map((name, i) => ({
    id: `team-${i}`,
    name,
    color: TEAM_COLORS[i],
    roster: pool.slice(i * 8, i * 8 + 8),
  }));
}

function getOpponent(id: string): OpponentTeam | undefined {
  return opponents.find(o => o.id === id);
}

function playerCard(hId: string, selectable: boolean, selectedVal: string, onSelect: (id: string) => void): string {
  const h = HOUSEWIVES.find(hw => hw.id === hId);
  if (!h) return '';
  const fc = getFranchiseColor(h.primaryFranchise);
  const tc = TIER_COLORS[h.tier];
  const isSelected = selectedVal === hId;
  return `
    <div class="trade-pc ${isSelected ? 'selected' : ''} ${selectable ? 'selectable' : ''}" data-id="${hId}" style="--fc:${fc}">
      <div class="tpc-stripe"></div>
      <div class="tpc-avatar" style="border-color:${fc}">${getInitials(h.name)}</div>
      <div class="tpc-info">
        <div class="tpc-name">${h.name}</div>
        <div class="tpc-meta"><span style="color:${fc}">${getFranchiseAbbr(h.primaryFranchise)}</span><span style="color:${tc};margin-left:5px">${TIER_LABELS[h.tier]}</span></div>
      </div>
      <div class="tpc-val" style="color:${tc}">${h.fantasyValue.toLocaleString()}</div>
      ${isSelected ? '<div class="tpc-check">✓</div>' : ''}
    </div>`;
}

export function renderTrades() {
  const panel = document.getElementById('trades-panel');
  if (!panel) return;

  buildOpponents();

  const opp = selectedOpponent ? getOpponent(selectedOpponent) : null;

  const oppListHTML = opponents.map(o => `
    <div class="trade-opp ${selectedOpponent === o.id ? 'active' : ''}" data-id="${o.id}" style="--oc:${o.color}">
      <div class="to-stripe"></div>
      <div class="to-icon" style="background:${o.color}22;border:1px solid ${o.color}55;color:${o.color}">
        ${o.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div class="to-info">
        <div class="to-name">${o.name}</div>
        <div class="to-count">${o.roster.length} players</div>
      </div>
    </div>`).join('');

  const myRosterHTML = roster.size === 0
    ? '<div class="trade-empty">Draft players first to propose a trade</div>'
    : Array.from(roster).map(id => playerCard(id, true, myOfferPick, (pid) => { myOfferPick = pid; })).join('');

  const theirRosterHTML = !opp
    ? '<div class="trade-empty">Select an opponent to see their roster</div>'
    : opp.roster.map(id => playerCard(id, true, theirOfferPick, (pid) => { theirOfferPick = pid; })).join('');

  const canPropose = myOfferPick && theirOfferPick && roster.size > 0 && opp;

  const valueComparison = () => {
    if (!myOfferPick || !theirOfferPick) return '';
    const myH = HOUSEWIVES.find(h => h.id === myOfferPick);
    const theirH = HOUSEWIVES.find(h => h.id === theirOfferPick);
    if (!myH || !theirH) return '';
    const diff = myH.fantasyValue - theirH.fantasyValue;
    const pct = Math.round((diff / theirH.fantasyValue) * 100);
    const color = diff > 0 ? '#5c9e6e' : diff < 0 ? '#b5426a' : '#c9a84c';
    const label = diff > 0 ? `You overpay by ${pct}% — trade likely accepted` : diff < 0 ? `You underpay by ${Math.abs(pct)}% — trade may be rejected` : 'Even trade — strong acceptance odds';
    return `<div class="trade-value-comp" style="color:${color}">${label}</div>`;
  };

  const pendingHTML = pendingTrades.length === 0
    ? '<div class="trade-empty" style="padding:10px 0">No trades yet</div>'
    : pendingTrades.map(t => {
        const myH = HOUSEWIVES.find(h => h.id === t.myOffer);
        const theirH = HOUSEWIVES.find(h => h.id === t.theirOffer);
        const oppTeam = getOpponent(t.fromTeam);
        const statusColor = t.status === 'accepted' ? '#5c9e6e' : t.status === 'rejected' ? '#b5426a' : '#c9a84c';
        return `
          <div class="trade-log-row">
            <div class="tlr-teams">${myH?.name ?? '?'} → ${theirH?.name ?? '?'}</div>
            <div class="tlr-opp">${oppTeam?.name ?? t.fromTeam}</div>
            <div class="tlr-status" style="color:${statusColor}">${t.status.toUpperCase()}</div>
          </div>`;
      }).join('');

  panel.innerHTML = `
    <div class="trade-layout">
      <!-- LEFT: Opponents -->
      <div class="trade-col trade-left">
        <div class="trade-col-header">
          <span class="trade-col-label">Opponents</span>
          <span class="trade-col-hint">Pick a team to trade with</span>
        </div>
        <div class="trade-opp-list" id="trade-opp-list">${oppListHTML}</div>

        <div class="trade-col-header" style="margin-top:2px">
          <span class="trade-col-label">Trade History</span>
        </div>
        <div class="trade-log">${pendingHTML}</div>
      </div>

      <!-- CENTER: My Roster -->
      <div class="trade-col trade-center">
        <div class="trade-col-header">
          <span class="trade-col-label">My Roster</span>
          <span class="trade-col-hint">Select player to offer</span>
        </div>
        <div class="trade-roster-list" id="trade-my-roster">${myRosterHTML}</div>
      </div>

      <!-- RIGHT: Proposal + Their Roster -->
      <div class="trade-col trade-right">
        <div class="trade-col-header">
          <span class="trade-col-label">Their Roster</span>
          <span class="trade-col-hint">${opp ? opp.name : 'Select an opponent'}</span>
        </div>
        <div class="trade-roster-list" id="trade-their-roster">${theirRosterHTML}</div>

        ${myOfferPick && theirOfferPick ? `
          <div class="trade-proposal-box">
            <div class="tpb-label">Trade Proposal</div>
            <div class="tpb-row">
              <div class="tpb-side">
                <div class="tpb-dir">You send</div>
                <div class="tpb-player">${HOUSEWIVES.find(h => h.id === myOfferPick)?.name ?? '—'}</div>
              </div>
              <div class="tpb-arrow">⇄</div>
              <div class="tpb-side">
                <div class="tpb-dir">You receive</div>
                <div class="tpb-player">${HOUSEWIVES.find(h => h.id === theirOfferPick)?.name ?? '—'}</div>
              </div>
            </div>
            ${valueComparison()}
            <button class="trade-submit-btn ${canPropose ? '' : 'disabled'}" id="trade-submit" ${canPropose ? '' : 'disabled'}>
              Propose Trade
            </button>
          </div>` : `
          <div class="trade-proposal-hint">
            Select a player from your roster and one from their roster to propose a trade
          </div>`}
      </div>
    </div>`;

  // Wire up event listeners
  document.getElementById('trade-opp-list')?.querySelectorAll<HTMLElement>('.trade-opp').forEach(el => {
    el.addEventListener('click', () => {
      selectedOpponent = el.dataset.id!;
      theirOfferPick = '';
      renderTrades();
    });
  });

  document.getElementById('trade-my-roster')?.querySelectorAll<HTMLElement>('.trade-pc.selectable').forEach(el => {
    el.addEventListener('click', () => {
      myOfferPick = myOfferPick === el.dataset.id ? '' : el.dataset.id!;
      renderTrades();
    });
  });

  document.getElementById('trade-their-roster')?.querySelectorAll<HTMLElement>('.trade-pc.selectable').forEach(el => {
    el.addEventListener('click', () => {
      theirOfferPick = theirOfferPick === el.dataset.id ? '' : el.dataset.id!;
      renderTrades();
    });
  });

  document.getElementById('trade-submit')?.addEventListener('click', () => {
    if (!myOfferPick || !theirOfferPick || !selectedOpponent) return;

    const myH = HOUSEWIVES.find(h => h.id === myOfferPick);
    const theirH = HOUSEWIVES.find(h => h.id === theirOfferPick);
    if (!myH || !theirH) return;

    // Acceptance probability: based on value ratio
    const ratio = myH.fantasyValue / theirH.fantasyValue;
    const acceptProb = ratio >= 0.85 ? 0.85 : ratio >= 0.7 ? 0.6 : 0.3;
    const accepted = Math.random() < acceptProb;

    const trade: TradeOffer = {
      id: Date.now().toString(),
      fromTeam: selectedOpponent,
      myOffer: myOfferPick,
      theirOffer: theirOfferPick,
      status: accepted ? 'accepted' : 'rejected',
      submittedAt: new Date().toISOString(),
    };

    pendingTrades.unshift(trade);

    if (accepted) {
      roster.delete(myOfferPick);
      roster.add(theirOfferPick);
      const opp = getOpponent(selectedOpponent);
      if (opp) {
        opp.roster = opp.roster.filter(id => id !== theirOfferPick);
        opp.roster.push(myOfferPick);
      }

      // Trigger fantasy refresh
      document.dispatchEvent(new CustomEvent('thl:trade-complete'));
    }

    myOfferPick = '';
    theirOfferPick = '';
    renderTrades();
  });
}
