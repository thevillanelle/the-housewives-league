import * as d3 from 'd3';
import { HOUSEWIVES } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'franchise' | 'housewife';
  label: string;
  color: string;
  value: number;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
}

let initialized = false;

export function initNetwork(containerId: string) {
  if (initialized) return;
  initialized = true;

  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 900;
  const height = container.clientHeight || 500;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('background', 'transparent');

  const g = svg.append('g');

  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
  );

  // Build nodes: only franchises that appear in our housewives data
  const franchisesInData = new Set(HOUSEWIVES.flatMap(h => h.franchises));
  const franchiseNodes: NetworkNode[] = FRANCHISES
    .filter(f => franchisesInData.has(f.id))
    .map(f => ({
      id: f.id,
      type: 'franchise',
      label: f.abbr,
      color: f.color,
      value: HOUSEWIVES.filter(h => h.primaryFranchise === f.id).length,
    }));

  // Housewives who appear in 2+ franchises create crossover links
  const crossoverLinks: NetworkLink[] = [];
  const housewifeCrossoverNodes: NetworkNode[] = [];

  HOUSEWIVES.filter(h => h.franchises.length >= 2).forEach(h => {
    housewifeCrossoverNodes.push({
      id: h.id,
      type: 'housewife',
      label: h.name.split(' ')[0],
      color: '#d4af37',
      value: h.fantasyValue,
    });
    h.franchises.forEach(fid => {
      if (franchisesInData.has(fid)) {
        crossoverLinks.push({ source: h.id, target: fid, strength: 0.3 });
      }
    });
  });

  // Also add direct franchise-to-franchise links via single-franchise housewives
  const directLinks: NetworkLink[] = [];
  const franchiseNodeIds = new Set(franchiseNodes.map(n => n.id));
  // pair up franchises that share housewives
  const sharedMap = new Map<string, number>();
  HOUSEWIVES.filter(h => h.franchises.length >= 2).forEach(h => {
    const validF = h.franchises.filter(f => franchiseNodeIds.has(f));
    for (let i = 0; i < validF.length; i++) {
      for (let j = i + 1; j < validF.length; j++) {
        const key = [validF[i], validF[j]].sort().join('|');
        sharedMap.set(key, (sharedMap.get(key) ?? 0) + 1);
      }
    }
  });
  sharedMap.forEach((count, key) => {
    const [a, b] = key.split('|');
    directLinks.push({ source: a, target: b, strength: Math.min(count * 0.2, 0.8) });
  });

  const allNodes: NetworkNode[] = [...franchiseNodes, ...housewifeCrossoverNodes];
  const allLinks = [...directLinks, ...crossoverLinks];

  const simulation = d3.forceSimulation<NetworkNode>(allNodes)
    .force('link', d3.forceLink<NetworkNode, NetworkLink>(allLinks)
      .id(d => d.id)
      .distance(d => d.strength > 0.5 ? 60 : 120)
      .strength(d => d.strength))
    .force('charge', d3.forceManyBody().strength(d => d.type === 'franchise' ? -200 : -60))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide<NetworkNode>().radius(d => d.type === 'franchise' ? 28 : 14));

  const link = g.append('g')
    .selectAll('line')
    .data(allLinks)
    .join('line')
    .attr('stroke', 'rgba(240,232,216,0.06)')
    .attr('stroke-width', 1);

  const node = g.append('g')
    .selectAll<SVGGElement, NetworkNode>('g')
    .data(allNodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(
      d3.drag<SVGGElement, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

  // Franchise nodes: colored circles
  node.filter(d => d.type === 'franchise')
    .append('circle')
    .attr('r', d => 14 + d.value * 2)
    .attr('fill', d => d.color + '22')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 1.5);

  node.filter(d => d.type === 'franchise')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', d => d.color)
    .attr('font-size', '8px')
    .attr('font-family', 'Space Mono, monospace')
    .attr('font-weight', '700')
    .attr('letter-spacing', '1px')
    .text(d => d.label);

  // Housewife crossover nodes: small gold diamonds
  node.filter(d => d.type === 'housewife')
    .append('circle')
    .attr('r', 5)
    .attr('fill', 'rgba(212,175,55,0.15)')
    .attr('stroke', '#d4af37')
    .attr('stroke-width', 1);

  node.filter(d => d.type === 'housewife')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -9)
    .attr('fill', 'rgba(212,175,55,0.7)')
    .attr('font-size', '7px')
    .attr('font-family', 'Inter, sans-serif')
    .text(d => d.label);

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'rgba(9,5,10,.9)')
    .style('border', '1px solid rgba(181,66,106,.3)')
    .style('padding', '8px 12px')
    .style('font-family', 'Space Mono, monospace')
    .style('font-size', '10px')
    .style('color', '#f0e8d8')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('letter-spacing', '1px')
    .style('z-index', '10');

  node.on('mouseover', (event, d) => {
    const label = d.type === 'franchise'
      ? `${d.label} · ${d.value} players`
      : `${d.label} · Crossover`;
    tooltip
      .style('opacity', '1')
      .style('left', (event.offsetX + 12) + 'px')
      .style('top', (event.offsetY - 20) + 'px')
      .text(label);
  }).on('mouseout', () => tooltip.style('opacity', '0'));

  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as unknown as NetworkNode).x ?? 0)
      .attr('y1', d => (d.source as unknown as NetworkNode).y ?? 0)
      .attr('x2', d => (d.target as unknown as NetworkNode).x ?? 0)
      .attr('y2', d => (d.target as unknown as NetworkNode).y ?? 0);

    node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
  });
}
