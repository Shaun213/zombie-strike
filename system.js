<script>
    // --- SYSTEM.JS LOGIC: Core Mechanics ---
    const GameState = {
        mc: 2500,
        hp: 100,
        kills: 0,
        streak: 0,
        wave: 1,
        squad: [],
        lastTime: performance.now(),
        frameCount: 0
    };

    // --- GAME.JS LOGIC: Rendering & AI ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Light and Floor
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Player Representative
    const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x4b5320 }));
    player.position.y = 1;
    scene.add(player);
    camera.position.set(0, 15, 10);
    camera.lookAt(player.position);

    // --- SQUAD AI SYSTEM ---
    function recruitSoldier() {
        if (GameState.mc >= 1000) {
            GameState.mc -= 1000;
            const soldier = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x3498db }));
            soldier.userData = { offset: new THREE.Vector3(Math.random() * 4 - 2, 0, 2) };
            scene.add(soldier);
            GameState.squad.push(soldier);
        }
    }

    // --- UI.JS LOGIC: Hud Updates & Killstreaks ---
    function updateHUD() {
        document.getElementById('mc-val').innerText = Math.floor(GameState.mc);
        document.getElementById('health-fill').style.width = GameState.hp + '%';
        document.getElementById('streak-fill').style.width = (GameState.streak / 15 * 100) + '%';
        document.getElementById('wave-val').innerText = `WAVE ${GameState.wave}`;

        // Airstrike Auto-Trigger
        if (GameState.streak >= 15) {
            triggerAirstrike();
        }
    }

    function triggerAirstrike() {
        GameState.streak = 0;
        // Visual feedback: Screen shake or red flash
        console.log("Airstrike Inbound!");
    }

    // --- MAIN LOOP ---
    function animate() {
        const now = performance.now();
        GameState.frameCount++;

        if (now >= GameState.lastTime + 1000) {
            document.getElementById('fps-counter').innerText = GameState.frameCount;
            GameState.frameCount = 0;
            GameState.lastTime = now;
        }

        // Squad Follow Logic
        GameState.squad.forEach(soldier => {
            const targetPos = player.position.clone().add(soldier.userData.offset);
            soldier.position.lerp(targetPos, 0.1);
            soldier.position.y = 0.9;
        });

        updateHUD();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    document.getElementById('open-shop').addEventListener('click', recruitSoldier);
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
</script>
</body>
</html>
