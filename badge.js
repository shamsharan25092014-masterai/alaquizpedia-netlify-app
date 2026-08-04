// badge.js – loads badge definitions and renders them on the Badges page
(async () => {
  try {
    const resp = await fetch('data/badges.json');
    if (!resp.ok) throw new Error('Failed to load badges');
    const badges = await resp.json();
    const container = document.getElementById('badge-grid');
    if (!container) return;
    badges.forEach(b => {
      const card = document.createElement('div');
      card.className = 'badge-card';
      card.innerHTML = `
        <div class="badge-icon">${b.icon ? b.icon : '🏅'}</div>
        <div class="badge-title">${b.title}</div>
        <div class="badge-desc">${b.description}</div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
  }
})();
