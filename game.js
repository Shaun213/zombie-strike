/* ============================================================
   UI.JS — Handles tactical HUD, Shop, and Killstreaks
   ============================================================ */

const UI = {
    // Updates the HUD elements based on the current GameState
    updateHUD() {
        // Update Military Credits
        const mcElement = document.getElementById('mc-val');
        if (mcElement) mcElement.innerText = Math.floor(GameState.mc);

        // Update Integrity (Health) Bar
        const hpBar = document.getElementById('health-fill');
        if (hpBar) hpBar.style.width = GameState.hp + '%';

        // Update Killstreak Progress
        const streakFill = document.getElementById('streak-fill');
        if (streakFill) {
            const progress = (GameState.streak / 15) * 100;
            streakFill.style.width = Math.min(progress, 100) + '%';
        }

        // Update Wave Counter
        const waveLabel = document.getElementById('wave-val');
        if (waveLabel) waveLabel.innerText = `WAVE ${GameState.wave}`;
    },

    // Toggles the Shop/Upgrade Terminal
    toggleShop() {
        const shop = document.getElementById('shop-modal');
        if (shop) {
            const isVisible = shop.style.display === 'flex';
            shop.style.display = isVisible ? 'none' : 'flex';
            // Pause/Unpause logic could go here
        }
    },

    // Visual feedback for Airstrikes
    playAirstrikeEffect() {
        const body = document.body;
        body.style.backgroundColor = '#ff4444'; // Red alert flash
        setTimeout(() => {
            body.style.backgroundColor = '#000';
        }, 500);
    }
};

// Listen for the "P" key to open shop
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') UI.toggleShop();
});
