const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

const Game = {
    mc: 2500, wave: 1, xp: 0, xpToNext: 100,
    zombies: [], bullets: [], squad: [],
    player: { x: 0, y: 0, hp: 100, weapon: { name: "Tactical Pistol", dmg: 20, rate: 250, next: 0, color: "#f1c40f" } },

    init() {
        System.init();
        requestAnimationFrame(t => this.loop(t));
    },

    // Buy new teammates to follow you!
    buySquad() {
        if (this.mc >= 2000) {
            this.mc -= 2000;
            this.squad.push({ x: this.player.x, y: this.player.y, offset: (this.squad.length + 1) * 60 });
            UI.toggleShop();
        }
    },

    update(dt) {
        // Player WASD
        const s = 450 * dt;
        if (System.keys['KeyW']) this.player.y -= s;
        if (System.keys['KeyS']) this.player.y += s;
        if (System.keys['KeyA']) this.player.x -= s;
        if (System.keys['KeyD']) this.player.x += s;

        // Squad AI: Follow the leader
        this.squad.forEach(bot => {
            bot.x += (this.player.x - bot.x - bot.offset) * 0.1;
            bot.y += (this.player.y - bot.y + 30) * 0.1;
        });

        // Shooting logic
        if (System.mouse.down && performance.now() > this.player.weapon.next) {
            this.shoot();
        }

        System.update(dt, this.player, canvas);
    },

    shoot() {
        const w = this.player.weapon;
        w.next = performance.now() + w.rate;
        const ang = Math.atan2(System.mouse.worldY - this.player.y, System.mouse.worldX - this.player.x);
        this.bullets.push({ x: this.player.x, y: this.player.y, vx: Math.cos(ang) * 15, vy: Math.sin(ang) * 15, life: 60 });
        System.camera.shake = 10;
    },

    draw() {
        ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width/2 - System.camera.x, canvas.height/2 - System.camera.y);
        
        // Draw 3D-ish World Grid
        ctx.strokeStyle = "#333";
        for(let i=-2000; i<=2000; i+=100) {
            ctx.beginPath(); ctx.moveTo(i, -2000); ctx.lineTo(i, 2000); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-2000, i); ctx.lineTo(2000, i); ctx.stroke();
        }

        // Draw Player (Blue Block)
        ctx.fillStyle = "#3498db"; ctx.fillRect(this.player.x-25, this.player.y-25, 50, 50);
        
        // Draw Squad (Yellow Blocks)
        this.squad.forEach(b => { ctx.fillStyle = "#f1c40f"; ctx.fillRect(b.x-20, b.y-20, 40, 40); });

        ctx.restore();
        UI.render(this);
    },

    loop(t) {
        this.update(0.016); this.draw();
        requestAnimationFrame(t => this.loop(t));
    }
};
Game.init();
