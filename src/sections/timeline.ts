import * as d3 from 'd3';
import { FRANCHISES } from '../data/franchises';

const REGION_COLORS: Record<string, string> = {
  'north-america': '#b5426a',
  'europe': '#a78bfa',
  'africa': '#e07a1e',
  'oceania': '#d4af37',
  'middle-east': '#20c9d0',
  'south-america': '#fb923c',
  'asia': '#e879f9',
};

let initialized = false;

export function initTimeline(containerId: string) {
  if (initialized) return;
  initialized = true;

  const container = document.getElementById(containerId);
  if (!container) return;

  const margin = { top: 20, right: 40, bottom: 40, left: 60 };
  const width = (container.clientWidth || 1000) - margin.left - margin.right;
  const height = 320 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const data = [...FRANCHISES].sort((a, b) => a.debutYear - b.debutYear);

  const x = d3.scaleLinear()
    .domain([2005, 2027])
    .range([0, width]);

  // Grid lines
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisBottom(x)
        .ticks(10)
        .tickSize(height)
        .tickFormat(() => '')
    )
    .call(gr => {
      gr.select('.domain').remove();
      gr.selectAll('.tick line').attr('stroke', 'rgba(181,66,106,0.08)');
    });

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .ticks(10)
        .tickFormat(d => String(d))
    )
    .call(ax => {
      ax.select('.domain').attr('stroke', 'rgba(181,66,106,.15)');
      ax.selectAll('text').attr('fill', '#7a5c68').attr('font-family', 'Space Mono, monospace').attr('font-size', '9px');
      ax.selectAll('.tick line').attr('stroke', 'rgba(181,66,106,.1)');
    });

  // Franchise dots
  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'rgba(9,5,10,.95)')
    .style('border', '1px solid rgba(181,66,106,.3)')
    .style('padding', '8px 12px')
    .style('font-family', 'Space Mono, monospace')
    .style('font-size', '9px')
    .style('color', '#f0e8d8')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('z-index', '10')
    .style('letter-spacing', '1px')
    .style('white-space', 'nowrap');

  // Jitter rows by status so dots don't stack
  const statusY: Record<string, number> = {
    active: height * 0.25,
    hiatus: height * 0.55,
    cancelled: height * 0.8,
  };

  const statusLabels = [
    { label: 'Active', y: statusY.active },
    { label: 'Hiatus', y: statusY.hiatus },
    { label: 'Cancelled', y: statusY.cancelled },
  ];

  // Lane labels
  g.selectAll('.lane-label')
    .data(statusLabels)
    .join('text')
    .attr('x', -8)
    .attr('y', d => d.y + 4)
    .attr('text-anchor', 'end')
    .attr('fill', '#7a5c68')
    .attr('font-family', 'Space Mono, monospace')
    .attr('font-size', '8px')
    .attr('letter-spacing', '1px')
    .text(d => d.label.toUpperCase());

  // Lane lines
  g.selectAll('.lane-line')
    .data(statusLabels)
    .join('line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', d => d.y)
    .attr('y2', d => d.y)
    .attr('stroke', 'rgba(181,66,106,.06)')
    .attr('stroke-dasharray', '4,4');

  // Dots
  g.selectAll('.tl-dot')
    .data(data)
    .join('circle')
    .attr('cx', d => x(d.debutYear))
    .attr('cy', d => statusY[d.status] ?? height / 2)
    .attr('r', 5)
    .attr('fill', d => REGION_COLORS[d.region] ?? '#b5426a')
    .attr('fill-opacity', d => d.status === 'cancelled' ? 0.3 : 0.8)
    .attr('stroke', d => REGION_COLORS[d.region] ?? '#b5426a')
    .attr('stroke-width', 1)
    .attr('cursor', 'pointer')
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', '1')
        .style('left', (event.offsetX + 12) + 'px')
        .style('top', (event.offsetY - 28) + 'px')
        .html(`${d.abbr} · ${d.name}<br>${d.debutYear} · ${d.network}`);
    })
    .on('mouseout', () => tooltip.style('opacity', '0'));
}
