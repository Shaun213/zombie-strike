const UI = {
    render(game) {
        document.getElementById('cash-txt').innerText = `💰 $${Math.floor(game.mc)}`;
        document.getElementById('weapon-txt').innerText = game.player.weapon.name.toUpperCase();
        document.getElementById('hp-fill').style.width = `${game.player.hp}%`;
        
        // XP Progress Scaling
        const xpPercent = (game.xp / game.xpToNext) * 100;
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        
        // Dynamic Notification
        const air = document.getElementById('air-ready');
        air.style.display = game.mc >= 5000 ? 'block' : 'none';
    },

    toggleShop() {
        const s = document.getElementById('shop-tablet');
        s.style.display = s.style.display === 'block' ? 'none' : 'block';
    }
};
