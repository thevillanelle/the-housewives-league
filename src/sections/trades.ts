import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { myTeam, getMyRosterSlugs } from './fantasy';
import { getCurrentUser, openAuthModal } from '../auth';
import {
  fetchOpponentTeams, proposeTrade, fetchPendingTrades, respondToTrade, fetchTeamTradeHistory,
  type OpponentTeam, type PendingTrade, type TradeHistoryEntry,
} from '../lib/game';

// ── State ────────────────────────────────────────────────────────────────

let opponents: OpponentTeam[] = [];
let pendingTrades: PendingTrade[] = [];
let tradeHistory: TradeHistoryEntry[] = [];
let selectedOpponent: string | null = null;
let myOfferPick = '';
let theirOfferPick = '';
let loadingTrades = false;
let proposing = false;
let tradeError = '';

function getFranchiseAbbr(id: string) {
  return FRANCHISES.find(f => f.id === id)?.abbr ?? id.toUpperCase();
}

function getFranchiseColor(id: string) {
  return FRANCHISES.find(f => f.id === id)?.color ?? '#7a5c68';
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function getOpponent(id: string): OpponentTeam | undefined {
  return opponents.find(o => o.teamId === id);
}

function playerCard(slug: string, selectedVal: string): string {
  const h = HOUSEWIVES.find(hw => hw.id === slug);
  if (!h) return '';
  const fc = getFranchiseColor(h.primaryFranchise);
  const tc = TIER_COLORS[h.tier];
  const isSelected = selectedVal === slug;
  return `
    <div class="trade-pc ${isSelected ? 'selected' : ''} selectable" data-id="${slug}" style="--fc:${fc}">
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

function lockedPanel(action: string): string {
  return `
    <div class="league-setup">
      <div class="ls-prompt">Sign in to ${action}</div>
      <div class="ls-btns"><button class="ls-btn" id="trades-lock-sign-in">Sign In</button></div>
    </div>`;
}

async function loadTradeData() {
  if (!myTeam) return;
  loadingTrades = true;
  renderShell();
  try {
    [opponents, pendingTrades, tradeHistory] = await Promise.all([
      fetchOpponentTeams(myTeam.leagueId, myTeam.teamId),
      fetchPendingTrades(myTeam.teamId),
      fetchTeamTradeHistory(myTeam.teamId),
    ]);
  } finally {
    loadingTrades = false;
    renderShell();
  }
}

export function renderTrades() {
  const panel = document.getElementById('trades-panel');
  if (!panel) return;

  if (!getCurrentUser()) {
    panel.innerHTML = lockedPanel('trade');
    document.getElementById('trades-lock-sign-in')?.addEventListener('click', openAuthModal);
    return;
  }

  if (!myTeam) {
    panel.innerHTML = '<div class="elog-empty-sub">Set up a league in the Command Center before trading.</div>';
    return;
  }

  if (opponents.length === 0 && pendingTrades.length === 0 && tradeHistory.length === 0 && !loadingTrades) {
    loadTradeData();
    return;
  }

  renderShell();
}

function renderShell() {
  const panel = document.getElementById('trades-panel');
  if (!panel || !myTeam) return;

  const myRosterSlugs = getMyRosterSlugs();
  const opp = selectedOpponent ? getOpponent(selectedOpponent) : null;

  const oppListHTML = opponents.map(o => `
    <div class="trade-opp ${selectedOpponent === o.teamId ? 'active' : ''}" data-id="${o.teamId}">
      <div class="to-stripe"></div>
      <div class="to-icon">${o.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div class="to-info">
        <div class="to-name">${o.name}</div>
        <div class="to-count">${o.roster.length} players</div>
      </div>
    </div>`).join('') || '<div class="trade-empty">No other teams in your league yet — share your invite code.</div>';

  const myRosterHTML = myRosterSlugs.length === 0
    ? '<div class="trade-empty">Draft players first to propose a trade</div>'
    : myRosterSlugs.map(slug => playerCard(slug, myOfferPick)).join('');

  const theirRosterHTML = !opp
    ? '<div class="trade-empty">Select an opponent to see their roster</div>'
    : opp.roster.map(slug => playerCard(slug, theirOfferPick)).join('');

  const canPropose = myOfferPick && theirOfferPick && myRosterSlugs.length > 0 && opp && !proposing;

  const valueComparison = () => {
    if (!myOfferPick || !theirOfferPick) return '';
    const myH = HOUSEWIVES.find(h => h.id === myOfferPick);
    const theirH = HOUSEWIVES.find(h => h.id === theirOfferPick);
    if (!myH || !theirH) return '';
    const diff = myH.fantasyValue - theirH.fantasyValue;
    const pct = Math.round((diff / theirH.fantasyValue) * 100);
    const color = diff > 0 ? '#5c9e6e' : diff < 0 ? '#b5426a' : '#c9a84c';
    const label = diff > 0 ? `You're offering ${pct}% more value` : diff < 0 ? `You're offering ${Math.abs(pct)}% less value` : 'Even value trade';
    return `<div class="trade-value-comp" style="color:${color}">${label}</div>`;
  };

  const pendingInboxHTML = pendingTrades.length === 0
    ? '<div class="trade-empty" style="padding:10px 0">No incoming offers</div>'
    : pendingTrades.map(t => {
        const myH = HOUSEWIVES.find(h => h.id === t.offeredSlug);
        const theirH = HOUSEWIVES.find(h => h.id === t.requestedSlug);
        return `
          <div class="trade-log-row">
            <div class="tlr-teams">${t.fromTeamName}: ${myH?.name ?? '?'} → for your ${theirH?.name ?? '?'}</div>
            <div class="tlr-actions" style="margin-top:6px">
              <button class="pm-draft-btn trade-accept-btn" data-id="${t.id}" style="margin-right:6px">Accept</button>
              <button class="pm-draft-btn trade-reject-btn" data-id="${t.id}">Reject</button>
            </div>
          </div>`;
      }).join('');

  const historyHTML = tradeHistory.length === 0
    ? '<div class="trade-empty" style="padding:10px 0">No trades yet</div>'
    : tradeHistory.map(t => {
        const offeredH = HOUSEWIVES.find(h => h.id === t.offeredSlug);
        const requestedH = HOUSEWIVES.find(h => h.id === t.requestedSlug);
        const statusColor = t.status === 'accepted' ? '#5c9e6e' : t.status === 'rejected' ? '#b5426a' : '#c9a84c';
        const label = t.isIncoming
          ? `${t.otherTeamName} offered ${offeredH?.name ?? '?'} for your ${requestedH?.name ?? '?'}`
          : `You offered ${offeredH?.name ?? '?'} for ${t.otherTeamName}'s ${requestedH?.name ?? '?'}`;
        return `
          <div class="trade-log-row">
            <div class="tlr-teams">${label}</div>
            <div class="tlr-status" style="color:${statusColor}">${t.status.toUpperCase()}</div>
          </div>`;
      }).join('');

  panel.innerHTML = `
    <div class="trade-layout">
      <div class="trade-col trade-left">
        <div class="trade-col-header">
          <span class="trade-col-label">Opponents</span>
          <span class="trade-col-hint">Pick a team to trade with</span>
        </div>
        <div class="trade-opp-list" id="trade-opp-list">${oppListHTML}</div>

        <div class="trade-col-header" style="margin-top:2px">
          <span class="trade-col-label">Pending Offers For You</span>
        </div>
        <div class="trade-log" id="trade-pending-list">${pendingInboxHTML}</div>

        <div class="trade-col-header" style="margin-top:2px">
          <span class="trade-col-label">Trade History</span>
        </div>
        <div class="trade-log">${historyHTML}</div>
      </div>

      <div class="trade-col trade-center">
        <div class="trade-col-header">
          <span class="trade-col-label">My Roster</span>
          <span class="trade-col-hint">Select player to offer</span>
        </div>
        <div class="trade-roster-list" id="trade-my-roster">${myRosterHTML}</div>
      </div>

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
              ${proposing ? 'Sending…' : 'Propose Trade'}
            </button>
            ${tradeError ? `<div style="color:#c0546e;font-size:11px;margin-top:8px">${tradeError}</div>` : ''}
          </div>` : `
          <div class="trade-proposal-hint">
            Select a player from your roster and one from their roster to propose a trade
          </div>`}
      </div>
    </div>`;

  document.getElementById('trade-opp-list')?.querySelectorAll<HTMLElement>('.trade-opp').forEach(el => {
    el.addEventListener('click', () => {
      selectedOpponent = el.dataset.id!;
      theirOfferPick = '';
      renderShell();
    });
  });

  document.getElementById('trade-my-roster')?.querySelectorAll<HTMLElement>('.trade-pc.selectable').forEach(el => {
    el.addEventListener('click', () => {
      myOfferPick = myOfferPick === el.dataset.id ? '' : el.dataset.id!;
      renderShell();
    });
  });

  document.getElementById('trade-their-roster')?.querySelectorAll<HTMLElement>('.trade-pc.selectable').forEach(el => {
    el.addEventListener('click', () => {
      theirOfferPick = theirOfferPick === el.dataset.id ? '' : el.dataset.id!;
      renderShell();
    });
  });

  document.getElementById('trade-submit')?.addEventListener('click', async () => {
    if (!myOfferPick || !theirOfferPick || !selectedOpponent || !myTeam) return;
    proposing = true;
    tradeError = '';
    renderShell();
    try {
      await proposeTrade(myTeam.leagueId, myTeam.teamId, selectedOpponent, myOfferPick, theirOfferPick);
      myOfferPick = '';
      theirOfferPick = '';
      await loadTradeData();
    } catch (err) {
      tradeError = err instanceof Error ? err.message : 'Could not send that trade.';
    } finally {
      proposing = false;
      renderShell();
    }
  });

  panel.querySelectorAll<HTMLElement>('.trade-accept-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await respondToTrade(btn.dataset.id!, true);
      await loadTradeData();
      document.dispatchEvent(new CustomEvent('thl:trade-complete'));
    });
  });

  panel.querySelectorAll<HTMLElement>('.trade-reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await respondToTrade(btn.dataset.id!, false);
      await loadTradeData();
    });
  });
}
