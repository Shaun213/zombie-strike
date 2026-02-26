const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Game = {
    mc: 2500, wave: 1, streak: 0, fps: 0, lastTime: 0,
    zombies: [], bullets: [], squad: [],
    
    player: {
        x: 0, y: 0, hp: 100, weaponIndex: 0,
        weapons: [
            { name: "Tactical Pistol", type: "ranged", ammo: 15, max: 15, rate: 200, next: 0, color: "#f1c40f" },
            { name: "Combat Knife", type: "melee", ammo: Infinity, range: 70, rate: 300, next: 0, color: "#95a5a6" }
        ]
    },

    init() {
        System.init();
        this.player.weapon = this.player.weapons[0];
        requestAnimationFrame(t => this.loop(t));
    },

    buySoldier(type) {
        const costs = { RIFLE: 1000, HEAVY: 2500 };
        if (this.mc >= costs[type] && this.squad.length < 3) {
            this.mc -= costs[type];
            this.squad.push({ x: this.player.x, y: this.player.y, type, cd: 0 });
            UI.toggleShop();
        }
    },

    update(dt) {
        const p = this.player;

        // 1. ADVANCED MOVEMENT
        let mx = 0, my = 0;
        if (System.keys['KeyW']) my = -1;
        if (System.keys['KeyS']) my = 1;
        if (System.keys['KeyA']) mx = -1;
        if (System.keys['KeyD']) mx = 1;

        const speed = 400 * dt;
        p.x += mx * speed;
        p.y += my * speed;

        // 2. WEAPON SWITCHING (1 for Pistol, 2 for Knife)
        if (System.keys['Digit1']) { p.weapon = p.weapons[0]; p.weaponIndex = 0; }
        if (System.keys['Digit2']) { p.weapon = p.weapons[1]; p.weaponIndex = 1; }

        // 3. COMBAT (Pistol/Knife logic)
        if (System.mouse.down && performance.now() > p.weapon.next) {
            this.attack();
        }

        // 4. SQUAD "LEASH" AI
        this.squad.forEach((bot, i) => {
            let dist = Math.hypot(p.x - bot.x, p.y - bot.y);
            if (dist > 100) {
                bot.x += (p.x - bot.x) * 3 * dt;
                bot.y += (p.y - bot.y) * 3 * dt;
            }
        });

        System.update(dt, p, canvas);
    },

    attack() {
        const w = this.player.weapon;
        w.next = performance.now() + w.rate;
        
        if (w.type === "ranged") {
            const angle = Math.atan2(System.mouse.worldY - this.player.y, System.mouse.worldX - this.player.x);
            this.bullets.push({
                x: this.player.x, y: this.player.y,
                vx: Math.cos(angle) * 1000, vy: Math.sin(angle) * 1000,
                life: 1.5, color: w.color
            });
            System.camera.shake = 6;
        } else {
            System.spawnJuice(this.player.x, this.player.y, "#ffffff", 4);
        }
    },

    draw() {
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width/2 - System.camera.x, canvas.height/2 - System.camera.y);
        if (System.camera.shake > 0) ctx.translate((Math.random()-0.5)*System.camera.shake, (Math.random()-0.5)*System.camera.shake);

        // WORLD GRID
        ctx.strokeStyle = "#222";
        for(let x = -2000; x < 2000; x += 100) {
            ctx.beginPath(); ctx.moveTo(x, -2000); ctx.lineTo(x, 2000); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-2000, x); ctx.lineTo(2000, x); ctx.stroke();
        }

        // DRAW PLAYER (Cartoonish Box)
        ctx.fillStyle = "#3498db";
        ctx.fillRect(this.player.x-25, this.player.y-25, 50, 50);

        // DRAW SQUAD
        this.squad.forEach(s => {
            ctx.fillStyle = s.type === "RIFLE" ? "#2ecc71" : "#e67e22";
            ctx.fillRect(s.x-20, s.y-20, 40, 40);
        });

        // DRAW PARTICLES
        System.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        ctx.restore();
        UI.render(this);
    },

    loop(time) {
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.fps = 1 / dt;
        this.lastTime = time;
        this.update(dt);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }
};

Game.init();
