/* ============================================================
   UI.JS — Interface Juice and HUD
   ============================================================ */

const UI = {
    update() {
        document.getElementById('mc-count').innerText = Math.floor(State.mc);
        document.getElementById('wave-num').innerText = State.wave;
        
        // Update bars
        const hpPct = (State.hp / State.maxHp) * 100;
        document.getElementById('integrity-fill').style.width = hpPct + '%';
        
        const streakPct = (State.streak / 15) * 100;
        document.getElementById('streak-fill').style.width = Math.min(streakPct, 100) + '%';
        document.getElementById('streak-text').innerText = State.streak;
    },

    toggleShop() {
        const modal = document.getElementById('shop-modal');
        modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    },

    screenShake(intensity = 8) {
        const canvas = document.getElementById('world-canvas');
        canvas.style.transform = `translate(${(Math.random()-0.5)*intensity}px, ${(Math.random()-0.5)*intensity}px)`;
        setTimeout(() => canvas.style.transform = 'translate(0,0)', 60);
    },

    redAlert() {
        document.body.style.backgroundColor = '#440000';
        setTimeout(() => document.body.style.backgroundColor = '#000', 200);
    }
};
