const UI = {
    render(game) {
        document.getElementById('mc-val').innerText = Math.floor(game.mc);
        document.getElementById('weapon-display').innerText = game.player.weapon.name.toUpperCase();
        document.getElementById('wave-display').innerText = `WAVE ${game.wave - 1}`;
        document.getElementById('hp-fill').style.width = `${game.player.hp}%`;
        document.getElementById('xp-fill').style.width = `${(game.xp / game.xpToNext) * 100}%`;
    },
    toggleShop() {
        const s = document.getElementById('shop-menu');
        s.style.display = s.style.display === 'block' ? 'none' : 'block';
    }
};
