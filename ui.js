const UI = {
    render(game) {
        document.getElementById('mc-display').innerText = Math.floor(game.mc);
        document.getElementById('mult-text').innerText = `X${game.mult}`;
        document.getElementById('hp-fill').style.width = `${game.player.hp}%`;
        document.getElementById('wave-text').innerText = `WAVE ${game.wave}`;
        document.getElementById('fps-box').innerText = `FPS: ${Math.round(game.fps)}`;
        
        const alert = document.getElementById('streak-alert');
        alert.style.display = game.streak >= 15 ? 'block' : 'none';
    },

    toggleShop() {
        const tablet = document.getElementById('shop-tablet');
        tablet.style.display = tablet.style.display === 'block' ? 'none' : 'block';
    }
};
