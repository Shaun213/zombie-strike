const Game = {
    scene: null, camera: null, renderer: null,
    player: null, squad: [], enemies: [],
    frames: 0, lastTime: performance.now(),

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Environment
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const grid = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        this.scene.add(grid);

        // Create Player
        const geo = new THREE.BoxGeometry(1, 2, 1);
        const mat = new THREE.MeshStandardMaterial({ color: State.playerColor });
        this.player = new THREE.Mesh(geo, mat);
        this.player.position.y = 1;
        this.scene.add(this.player);

        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(this.player.position);

        this.loop();
    },

    loop() {
        if (!State.active) return;
        requestAnimationFrame(() => this.loop());

        // FPS Counter
        this.frames++;
        const now = performance.now();
        if (now >= this.lastTime + 1000) {
            document.getElementById('fps-val').innerText = this.frames;
            this.frames = 0;
            this.lastTime = now;
        }

        // Squad AI (Lerp follow)
        this.squad.forEach((mate, i) => {
            const target = this.player.position.clone().add(new THREE.Vector3(i + 2, 0, 2));
            mate.position.lerp(target, 0.1);
        });

        UI.update();
        this.renderer.render(this.scene, this.camera);
    }
};

function initializeGame() {
    State.active = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    Game.init();
}
