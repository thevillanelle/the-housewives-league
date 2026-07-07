export function initFantasy() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  grid.innerHTML = Array.from({ length: 10 }, (_, i) => `
    <div class="roster-slot">
      <div class="rs-icon">◇</div>
      <div class="rs-label">Slot ${i + 1}</div>
    </div>
  `).join('');
}
