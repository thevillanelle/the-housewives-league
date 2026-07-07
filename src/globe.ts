// @ts-ignore — globe.gl ships its own types but bundler resolution varies
import Globe from 'globe.gl';
import { FRANCHISES, type Franchise } from './data/franchises';
import { openFranchise, closeSidebar } from './sidebar';

let globeInstance: ReturnType<typeof Globe> | null = null;

function buildMarker(f: Franchise): HTMLElement {
  const el = document.createElement('div');
  el.className = `marker ${f.status}`;
  el.style.cssText = `--mc:${f.color};width:24px;height:24px;cursor:pointer;pointer-events:auto`;
  el.title = f.shortName;

  const delay = (Math.random() * 2.5).toFixed(2);
  el.innerHTML = `
    <div class="m-ring" style="animation-delay:${delay}s"></div>
    <div class="m-ring m-ring2" style="animation-delay:${(+delay + 1.1).toFixed(2)}s"></div>
    <div class="m-dot"></div>
  `;

  // Use pointerdown/up to distinguish click vs. globe drag
  let pdTime = 0, pdX = 0, pdY = 0;
  el.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    pdTime = Date.now();
    pdX = e.clientX;
    pdY = e.clientY;
  });
  el.addEventListener('pointerup', (e) => {
    if (Date.now() - pdTime < 400 && Math.abs(e.clientX - pdX) < 8 && Math.abs(e.clientY - pdY) < 8) {
      openFranchise(f);
      globeInstance?.controls().autoRotate && (globeInstance.controls().autoRotate = false);
    }
  });

  return el;
}

export function initGlobe() {
  globeInstance = Globe({ animateIn: false })
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#3d0a1e')
    .atmosphereAltitude(0.20)
    .htmlElementsData(FRANCHISES)
    .htmlElement((d: unknown) => buildMarker(d as Franchise))
    .htmlLat((d: unknown) => (d as Franchise).lat)
    .htmlLng((d: unknown) => (d as Franchise).lng)
    .htmlAltitude(0.01)
    (document.getElementById('globe-wrap')!);

  globeInstance.width(window.innerWidth).height(window.innerHeight);
  window.addEventListener('resize', () => {
    globeInstance?.width(window.innerWidth).height(window.innerHeight);
  });

  globeInstance.controls().autoRotate = true;
  globeInstance.controls().autoRotateSpeed = 0.18;
  globeInstance.controls().enableDamping = true;

  // Start view centered roughly over the Atlantic so both Americas and Europe are visible
  globeInstance.pointOfView({ lat: 20, lng: -30, altitude: 2.2 }, 0);

  // Resume auto-rotate when user clicks empty globe space
  globeInstance.onGlobeClick(() => {
    closeSidebar();
    if (globeInstance) globeInstance.controls().autoRotate = true;
  });

  // Handle WebGL context loss
  const canvas = document.querySelector('#globe-wrap canvas');
  canvas?.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    const msg = document.createElement('div');
    msg.style.cssText =
      'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);z-index:9999;color:#f0e8d8;font-family:Space Mono,monospace;font-size:13px;text-align:center;';
    msg.innerHTML =
      '<div><div style="font-size:22px;margin-bottom:12px">⚠</div>Globe context lost.<br><br><button onclick="location.reload()" style="margin-top:12px;padding:8px 24px;background:#b5426a;border:none;border-radius:8px;color:#fff;font-family:inherit;cursor:pointer;font-size:13px">↺ Reload</button></div>';
    document.body.appendChild(msg);
  });
}

export function getGlobe() {
  return globeInstance;
}
