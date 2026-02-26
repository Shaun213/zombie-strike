const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Game = {
    // Game State
    mc: 2500, wave: 1, streak: 0, mult: 1, 
    enemies: [], bullets: [], squad: [], particles: [],
    lastUpdate: 0, paused: false,

    // Raycasting Player
    player: {
        x: 12, y: 12, dirX: -1, dirY: 0, planeX: 0, planeY: 0.66,
        hp: 100, maxHp: 100, regen: false,
        weapon: { dmg: 35, rate: 180, next: 0, level: 1 }
    },

    // 1 = Wall, 0 = Floor
    map: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],

    init() {
        System.init();
        this.spawnWave();
        requestAnimationFrame(t => this.loop(t));
    },

    // Purchase Logic
    purchase(item) {
        const costs = { RIFLEMAN: 1000, HEAVY: 2000, MEDIC: 1500, DMG_UP: 1500, RATE_UP: 2000, PERK_REGEN: 3000 };
        if (this.mc >= costs[item]) {
            this.mc -= costs[item];
            if (item === 'RIFLEMAN') this.squad.push({ type: 'RIFLE', x: this.player.x, y: this.player.y, dmg: 20, rate: 500, next: 0 });
            if (item === 'PERK_REGEN') this.player.regen = true;
            if (item === 'DMG_UP') this.player.weapon.dmg += 15;
            UI.updateDisplay(this);
        }
    },

    spawnWave() {
        const isBoss = this.wave % 5 === 0;
        const count = isBoss ? 1 : 10 + (this.wave * 2);
        for(let i=0; i<count; i++) {
            this.enemies.push({
                x: 2 + Math.random() * 20, y: 2 + Math.random() * 4,
                hp: isBoss ? 2500 : 60 + (this.wave * 10),
                isBoss, speed: isBoss ? 0.015 : 0.03 + Math.random() * 0.02,
                size: isBoss ? 1.5 : 0.4
            });
        }
    },

    update(dt) {
        if (this.paused) return;
        const p = this.player;
        const moveS = 4.5 * dt;
        const rotS = 3.0 * dt;

        // Multiplier Engine
        this.mult = 1 + Math.floor(this.streak / 5);
        if (this.mult > 5) this.mult = 5;

        // Player Movement & Ray-Collision
        if (System.keys['KeyW']) {
            if (this.map[Math.floor(p.x + p.dirX * moveS)][Math.floor(p.y)] === 0) p.x += p.dirX * moveS;
            if (this.map[Math.floor(p.x)][Math.floor(p.y + p.dirY * moveS)] === 0) p.y += p.dirY * moveS;
        }
        if (System.keys['KeyS']) {
            if (this.map[Math.floor(p.x - p.dirX * moveS)][Math.floor(p.y)] === 0) p.x -= p.dirX * moveS;
            if (this.map[Math.floor(p.x)][Math.floor(p.y - p.dirY * moveS)] === 0) p.y -= p.dirY * moveS;
        }

        // Rotation Matrix
        if (System.keys['KeyA']) {
            let oldDirX = p.dirX;
            p.dirX = p.dirX * Math.cos(rotS) - p.dirY * Math.sin(rotS);
            p.dirY = oldDirX * Math.sin(rotS) + p.dirY * Math.cos(rotS);
            let oldPlaneX = p.planeX;
            p.planeX = p.planeX * Math.cos(rotS) - p.planeY * Math.sin(rotS);
            p.planeY = oldPlaneX * Math.sin(rotS) + p.planeY * Math.cos(rotS);
        }
        if (System.keys['KeyD']) {
            let oldDirX = p.dirX;
            p.dirX = p.dirX * Math.cos(-rotS) - p.dirY * Math.sin(-rotS);
            p.dirY = oldDirX * Math.sin(-rotS) + p.dirY * Math.cos(-rotS);
            let oldPlaneX = p.planeX;
            p.planeX = p.planeX * Math.cos(-rotS) - p.planeY * Math.sin(-rotS);
            p.planeY = oldPlaneX * Math.sin(-rotS) + p.planeY * Math.cos(-rotS);
        }

        // Shooting System
        if (System.mouse.down && performance.now() > p.weapon.next) {
            this.fire();
        }

        // Airstrike Killstreak (G)
        if (System.keys['KeyG'] && this.streak >= 15) {
            this.triggerAirstrike();
        }

        // Perk: Auto-Regen
        if (p.regen && p.hp < p.maxHp) p.hp += 0.05;

        // Enemy AI & Damage
        this.enemies.forEach(z => {
            const angle = Math.atan2(p.y - z.y, p.x - z.x);
            z.x += Math.cos(angle) * z.speed;
            z.y += Math.sin(angle) * z.speed;
            if (Math.hypot(p.x - z.x, p.y - z.y) < 0.6) {
                p.hp -= 0.5;
                this.streak = 0; // Reset streak on damage
            }
        });

        if (this.enemies.length === 0) { this.wave++; this.spawnWave(); }
        System.update(dt);
    },

    fire() {
        const p = this.player;
        p.weapon.next = performance.now() + p.weapon.rate;
        System.shake = 12;
        // Hitscan logic
        this.enemies.forEach(z => {
            const dist = Math.hypot(p.x - z.x, p.y - z.y);
            if (dist < 4) { // Accuracy check
                z.hp -= p.weapon.dmg;
                if (z.hp <= 0) {
                    this.mc += (z.isBoss ? 1000 : 20) * this.mult;
                    this.streak++;
                }
            }
        });
        this.enemies = this.enemies.filter(z => z.hp > 0);
    },

    triggerAirstrike() {
        this.enemies = [];
        this.streak = 0;
        System.shake = 60;
        this.mc += 500;
        console.log("AIRSTRIKE INBOUND!");
    },

    draw() {
        // Floor & Ceiling
        ctx.fillStyle = "#0c0c0c"; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
        ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

        // Raycasting Loop
        for(let x=0; x<canvas.width; x+=4) {
            let cameraX = 2 * x / canvas.width - 1;
            let rayX = this.player.dirX + this.player.planeX * cameraX;
            let rayY = this.player.dirY + this.player.planeY * cameraX;

            let mapX = Math.floor(this.player.x);
            let mapY = Math.floor(this.player.y);
            
            let dX = Math.abs(1 / rayX), dY = Math.abs(1 / rayY);
            let sideX, sideY, stepX, stepY, hit = 0, side;

            if (rayX < 0) { stepX = -1; sideX = (this.player.x - mapX) * dX; }
            else { stepX = 1; sideX = (mapX + 1.0 - this.player.x) * dX; }
            if (rayY < 0) { stepY = -1; sideY = (this.player.y - mapY) * dY; }
            else { stepY = 1; sideY = (mapY + 1.0 - this.player.y) * dY; }

            while(hit === 0) {
                if (sideX < sideY) { sideX += dX; mapX += stepX; side = 0; }
                else { sideY += dY; mapY += stepY; side = 1; }
                if (this.map[mapX][mapY] > 0) hit = 1;
            }

            let dist = (side === 0) ? (sideX - dX) : (sideY - dY);
            let h = Math.floor(canvas.height / dist);
            
            ctx.fillStyle = side === 1 ? "#3b4310" : "#4b5320"; // Darker walls for depth
            ctx.fillRect(x, (canvas.height - h)/2 + System.shakeY, 4, h);
        }

        UI.updateDisplay(this);
    },

    loop(t) {
        const dt = (t - this.lastUpdate) / 1000;
        this.lastUpdate = t;
        this.update(dt || 0.016);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }
};
Game.init();
