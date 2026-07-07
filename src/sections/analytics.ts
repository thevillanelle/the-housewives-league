import * as d3 from 'd3';
import { HOUSEWIVES, TIER_COLORS, type Housewife } from '../data/housewives';

let initialized = false;

export function initAnalytics(containerId: string) {
  if (initialized) return;
  initialized = true;

  const container = document.getElementById(containerId);
  if (!container) return;

  renderValueChart(container);
  renderTierBreakdown(container);
}

function renderValueChart(container: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'analytics-panel';

  const label = document.createElement('div');
  label.className = 'analytics-label';
  label.textContent = 'Top 15 Players by Fantasy Value';
  wrap.appendChild(label);

  const chartEl = document.createElement('div');
  chartEl.id = 'analytics-bar-chart';
  wrap.appendChild(chartEl);
  container.appendChild(wrap);

  const top15 = [...HOUSEWIVES]
    .sort((a, b) => b.fantasyValue - a.fantasyValue)
    .slice(0, 15);

  const margin = { top: 10, right: 80, bottom: 10, left: 160 };
  const width = (chartEl.clientWidth || 600) - margin.left - margin.right;
  const barH = 26;
  const gap = 4;
  const height = top15.length * (barH + gap);

  const svg = d3.select(chartEl)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top15, d => d.fantasyValue) ?? 1000])
    .range([0, width]);

  const y = d3.scaleBand<number>()
    .domain(top15.map((_, i) => i))
    .range([0, height])
    .padding(0.15);

  // Bars
  g.selectAll('.bar')
    .data(top15)
    .join('rect')
    .attr('x', 0)
    .attr('y', (_, i) => y(i) ?? 0)
    .attr('width', d => x(d.fantasyValue))
    .attr('height', y.bandwidth())
    .attr('fill', d => TIER_COLORS[d.tier])
    .attr('fill-opacity', 0.25)
    .attr('rx', 2);

  // Bar accent line
  g.selectAll('.bar-line')
    .data(top15)
    .join('line')
    .attr('x1', 0)
    .attr('x2', d => x(d.fantasyValue))
    .attr('y1', (_, i) => (y(i) ?? 0) + y.bandwidth())
    .attr('y2', (_, i) => (y(i) ?? 0) + y.bandwidth())
    .attr('stroke', d => TIER_COLORS[d.tier])
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.5);

  // Name labels (left)
  g.selectAll('.name-label')
    .data(top15)
    .join('text')
    .attr('x', -8)
    .attr('y', (_, i) => (y(i) ?? 0) + y.bandwidth() / 2 + 1)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#f0e8d8')
    .attr('font-size', '11px')
    .attr('font-family', 'Inter, sans-serif')
    .text(d => d.name);

  // Value labels (right)
  g.selectAll('.val-label')
    .data(top15)
    .join('text')
    .attr('x', d => x(d.fantasyValue) + 8)
    .attr('y', (_, i) => (y(i) ?? 0) + y.bandwidth() / 2 + 1)
    .attr('dominant-baseline', 'middle')
    .attr('fill', d => TIER_COLORS[d.tier])
    .attr('font-size', '10px')
    .attr('font-family', 'Space Mono, monospace')
    .attr('font-weight', '700')
    .text(d => d.fantasyValue.toLocaleString());
}

function renderTierBreakdown(container: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'analytics-panel analytics-tier-panel';

  const label = document.createElement('div');
  label.className = 'analytics-label';
  label.textContent = 'Player Pool by Tier';
  wrap.appendChild(label);

  const tiers: Record<string, Housewife[]> = {};
  HOUSEWIVES.forEach(h => {
    if (!tiers[h.tier]) tiers[h.tier] = [];
    tiers[h.tier].push(h);
  });

  const tierOrder = ['legendary', 'elite', 'premium', 'standard', 'developing'];
  const rows = tierOrder.map(tier => ({ tier, count: tiers[tier]?.length ?? 0 })).filter(r => r.count > 0);

  const maxCount = Math.max(...rows.map(r => r.count));
  const rowsHtml = rows.map(r => `
    <div class="tier-row">
      <div class="tier-name" style="color:${TIER_COLORS[r.tier as keyof typeof TIER_COLORS]}">${r.tier.toUpperCase()}</div>
      <div class="tier-bar-wrap">
        <div class="tier-bar" style="width:${(r.count / maxCount) * 100}%;background:${TIER_COLORS[r.tier as keyof typeof TIER_COLORS]}"></div>
      </div>
      <div class="tier-count">${r.count}</div>
    </div>
  `).join('');

  const rowsEl = document.createElement('div');
  rowsEl.className = 'tier-rows';
  rowsEl.innerHTML = rowsHtml;
  wrap.appendChild(rowsEl);
  container.appendChild(wrap);
}
