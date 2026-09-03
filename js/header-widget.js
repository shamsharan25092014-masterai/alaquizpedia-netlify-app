// Header / Footer XP & Badge widget
// This script fetches user achievements and populates the widget in the nav/footer.
import { getUserAchievements } from "./storage.js";

function renderWidget() {
  const widget = document.getElementById("xpBadgeWidget");
  if (!widget) return;
  const xpSpan = document.getElementById("xpCount");
  const badgeContainer = document.getElementById("widgetBadges");
  getUserAchievements(window.currentUserId || null)
    .then(data => {
      const { totalXP, badges } = data;
      xpSpan.textContent = `${totalXP} XP`;
      // Show up to 3 badge icons
      badgeContainer.innerHTML = "";
      (badges || []).slice(0, 3).forEach(b => {
        const img = document.createElement("img");
        img.src = `data/badges/${b.id}.png`;
        img.alt = b.name;
        img.title = b.name;
        img.className = "widget-badge-icon";
        badgeContainer.appendChild(img);
      });
    })
    .catch(() => {
      xpSpan.textContent = "0 XP";
      badgeContainer.innerHTML = "";
    });
}

// Run after DOM loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderWidget);
} else {
  renderWidget();
}
