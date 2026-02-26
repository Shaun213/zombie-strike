const System = {
    camera: { x: 0, y: 0, zoom: 1, shake: 0 },
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    particles: [],
    
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
    },

    // The "Juice": Camera shake and Blood
    update(dt, target) {
        // Camera smooth follow
        this.camera.x += (target.x - this.camera.x) * 0.1;
        this.camera.y += (target.y - this.camera.y) * 0.1;
        if (this.shake > 0) this.shake *= 0.9;

        // Particle physics
        this.particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        });
    },

    spawnBlood(x, y) {
        for(let i=0; i<8; i++) {
            this.particles.push({
                x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                life: 1, color: '#ff3e3e'
            });
        }
    }
};
