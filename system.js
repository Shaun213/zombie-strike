const System = {
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    shake: 0, shakeY: 0,

    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
        
        // Special Key: P for Shop
        window.addEventListener('keydown', e => {
            if (e.code === 'KeyP') UI.toggleShop();
        });
    },

    update(dt) {
        // Dynamic Screen Shake logic
        if (this.shake > 0) {
            this.shakeY = (Math.random() - 0.5) * this.shake;
            this.shake *= 0.9;
        } else {
            this.shakeY = 0;
        }
    }
};
