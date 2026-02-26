const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Game = {
    mc: 2500, wave: 1, xp: 0, xpToNext: 100,
    zombies: [], bullets: [], squad: [],
    player: {
        x: 0, y: 0, hp: 100, 
        weapon: { name: "Tactical Pistol", dmg: 25, rate: 200, next: 0, color: "#f1c40f" }
    },
    lastTime: 0,

    init() {
        System.init();
        requestAnimationFrame(t => this.loop(t));
    },

    buyWeapon(name, cost) {
        if (this.mc >= cost) {
            this.mc -= cost;
            this.player.weapon = { name, dmg: name === 'UZI' ? 15 : 80, rate: name === 'UZI' ? 100 : 800, next: 0, color: "#3498db" };
            UI.toggleShop();
        }
    },

    update(dt) {
        // Smooth WASD Movement
        let mx = 0, my = 0;
        if (System.keys['KeyW']) my = -1;
        if (System.keys['KeyS']) my = 1;
        if (System.keys['KeyA']) mx = -1;
        if (System.keys['KeyD']) mx = 1;

        const moveSpeed = 400 * dt;
        this.player.x += mx * moveSpeed;
        this.player.y += my * moveSpeed;

        // Auto-Spawn Waves
        if (this.zombies.length === 0) this.spawnWave();

        // Combat Engine
        if (System.mouse.down && performance.now() > this.player.weapon.next) {
            this.shoot();
        }

        System.update(dt, this.player, canvas);
    },

    shoot() {
        const w = this.player.weapon;
        w.next = performance.now() + w.rate;
        const angle = Math.atan2(System.mouse.worldY - this.player.y, System.mouse.worldX - this.player.x);
        this.bullets.push({ x: this.player.x, y: this.player.y, vx: Math.cos(angle) * 1200, vy: Math.sin(angle) * 1200, life: 1.0 });
        System.camera.shake = 8;
    },

    spawnWave() {
        for(let i=0; i < 5 + this.wave * 2; i++) {
            this.zombies.push({
                x: this.player.x + (Math.random()-0.5)*1800,
                y: this.player.y + (Math.random()-0.5)*1800,
                hp: 50 + this.wave * 10, speed: 120 + Math.random()*80
            });
        }
        this.wave++;
    },

    draw() {
        ctx.fillStyle = "#151515";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width/2 - System.camera.x, canvas.height/2 - System.camera.y);
        
        // Draw World Grid
        ctx.strokeStyle = "#252525";
        for(let i=-2000; i<=2000; i+=100) {
            ctx.beginPath(); ctx.moveTo(i, -2000); ctx.lineTo(i, 2000); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-2000, i); ctx.lineTo(2000, i); ctx.stroke();
        }

        // Draw Player & Squad
        ctx.fillStyle = "#3498db";
        ctx.fillRect(this.player.x-25, this.player.y-25, 50, 50);

        // Draw Zombies
        this.zombies.forEach(z => {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(z.x-20, z.y-20, 40, 40);
        });

        ctx.restore();
        UI.render(this);
    },

    loop(time) {
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        this.update(dt);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }
};
Game.init();
