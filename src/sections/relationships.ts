import * as d3 from 'd3';
import { HOUSEWIVES, TIER_COLORS } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { RELATIONSHIPS, REL_COLORS, REL_LABELS, type RelationType } from '../data/relationships';

let activeFilter: string = 'all';
let initialized = false;

function getFranchiseColor(id: string) {
  return FRANCHISES.find(f => f.id === id)?.color ?? '#7a5c68';
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export function initRelationships(containerId: string) {
  if (initialized) return;
  initialized = true;

  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div class="rel-toolbar">
      <div class="rel-filters" id="rel-filters">
        <button class="rf-btn active" data-filter="all">All</button>
        <button class="rf-btn enemy" data-filter="enemy">Enemies</button>
        <button class="rf-btn frenemy" data-filter="frenemy">Frenemies</button>
        <button class="rf-btn ally" data-filter="ally">Allies</button>
        <button class="rf-btn friend" data-filter="friend">Friends</button>
        <button class="rf-btn former_friend" data-filter="former_friend">Former Friends</button>
        <button class="rf-btn family" data-filter="family">Family</button>
      </div>
      <div class="rel-legend">
        ${Object.entries(REL_LABELS).map(([type, label]) => `
          <div class="rl-item">
            <div class="rl-dot" style="background:${REL_COLORS[type as RelationType]}"></div>
            <span>${label}</span>
          </div>`).join('')}
      </div>
    </div>
    <div id="rel-viz" style="position:relative"></div>
    <div class="rel-tooltip" id="rel-tooltip" style="display:none"></div>`;

  document.getElementById('rel-filters')?.querySelectorAll<HTMLElement>('.rf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter!;
      drawViz(containerId);
    });
  });

  drawViz(containerId);
}

function drawViz(containerId: string) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const vizEl = document.getElementById('rel-viz');
  if (!vizEl) return;

  const filteredRels = activeFilter === 'all'
    ? RELATIONSHIPS
    : RELATIONSHIPS.filter(r => r.type === activeFilter);

  const playerIds = new Set<string>();
  filteredRels.forEach(r => { playerIds.add(r.a); playerIds.add(r.b); });

  const nodes = HOUSEWIVES
    .filter(h => playerIds.has(h.id))
    .map(h => ({ id: h.id, name: h.name, franchise: h.primaryFranchise, tier: h.tier }));

  const links = filteredRels.map(r => ({
    source: r.a,
    target: r.b,
    type: r.type,
    label: r.label,
  }));

  const width = vizEl.clientWidth || 800;
  const height = 520;

  d3.select(vizEl).select('svg').remove();

  const svg = d3.select(vizEl).append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('style', 'display:block');

  const g = svg.append('g');

  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
  );

  const sim = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(90).strength(0.4))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(28));

  const link = g.append('g').selectAll('line')
    .data(links).join('line')
    .attr('stroke', d => REL_COLORS[d.type as RelationType])
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6)
    .attr('stroke-dasharray', d => d.type === 'former_friend' ? '4,3' : null);

  const tooltip = document.getElementById('rel-tooltip')!;

  const node = g.append('g').selectAll('g')
    .data(nodes).join('g')
    .attr('cursor', 'pointer')
    .call(
      d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

  node.append('circle')
    .attr('r', 18)
    .attr('fill', d => getFranchiseColor(d.franchise))
    .attr('fill-opacity', 0.18)
    .attr('stroke', d => getFranchiseColor(d.franchise))
    .attr('stroke-width', 1.5);

  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', '9px')
    .attr('font-family', 'Space Mono,monospace')
    .attr('fill', d => TIER_COLORS[d.tier])
    .attr('font-weight', '700')
    .text(d => getInitials(d.name));

  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 28)
    .attr('font-size', '8px')
    .attr('font-family', 'Inter,sans-serif')
    .attr('fill', '#c8bfb8')
    .text(d => d.name.split(' ')[0]);

  node.on('mouseover', (event, d: any) => {
    const rels = RELATIONSHIPS.filter(r => r.a === d.id || r.b === d.id);
    const lines = rels.map(r => {
      const other = r.a === d.id ? r.b : r.a;
      const otherH = HOUSEWIVES.find(h => h.id === other);
      return `<div class="rtt-row"><span class="rtt-type" style="color:${REL_COLORS[r.type]}">${REL_LABELS[r.type]}</span><span class="rtt-name">${otherH?.name ?? other}</span></div>`;
    });
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<div class="rtt-name-big">${d.name}</div>${lines.join('')}`;
    tooltip.style.left = `${event.offsetX + 12}px`;
    tooltip.style.top = `${event.offsetY - 8}px`;
  }).on('mouseout', () => { tooltip.style.display = 'none'; });

  link.on('mouseover', (event, d: any) => {
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<div class="rtt-rel" style="color:${REL_COLORS[d.type]}">${REL_LABELS[d.type]}</div><div style="font-size:10px;color:var(--muted);margin-top:4px">${d.label}</div>`;
    tooltip.style.left = `${event.offsetX + 12}px`;
    tooltip.style.top = `${event.offsetY - 8}px`;
  }).on('mouseout', () => { tooltip.style.display = 'none'; });

  sim.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  });
}
