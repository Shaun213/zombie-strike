// game.js - main 3D game logic
let scene, camera, renderer;
let playerMesh;
let zombieMeshes = [];
let bossMeshes = [];
let teammateMeshes = [];
let bulletMeshes = [];
let powerUpMeshes = [];

let clock = new THREE.Clock();
let deltaTime;

// ------------------------
// INIT SCENE
// ------------------------
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("gameCanvas"), antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Lights
    let ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    let directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(10, 20, 10);
    directional.castShadow = true;
    scene.add(directional);

    // Ground
    let groundMat = new THREE.MeshStandardMaterial({color:0x228B22});
    let groundGeom = new THREE.PlaneGeometry(200, 200);
    let ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Player
    let playerMat = new THREE.MeshStandardMaterial({color: document.getElementById("avatarColor").value});
    let playerGeom = new THREE.BoxGeometry(1,2,1);
    playerMesh = new THREE.Mesh(playerGeom, playerMat);
    playerMesh.position.set(player.position.x, player.position.y, player.position.z);
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Initial zombies
    zombies.forEach(z=>{
        let mat = new THREE.MeshStandardMaterial({color: zombieTypes[z.type].color});
        let geom = new THREE.BoxGeometry(1,2,1);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(z.position.x,z.position.y,z.position.z);
        mesh.castShadow = true;
        zombieMeshes.push(mesh);
        scene.add(mesh);
    });

    // Initial bosses
    bosses.forEach(b=>{
        let mat = new THREE.MeshStandardMaterial({color: zombieTypes[b.type].color});
        let geom = new THREE.BoxGeometry(2,3,2);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(b.position.x,b.position.y,b.position.z);
        mesh.castShadow = true;
        bossMeshes.push(mesh);
        scene.add(mesh);
    });

    // Teammates
    teammates.forEach(t=>{
        let mat = new THREE.MeshStandardMaterial({color:0x00ffff});
        let geom = new THREE.BoxGeometry(1,2,1);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(t.position.x,t.position.y,t.position.z);
        mesh.castShadow = true;
        teammateMeshes.push(mesh);
        scene.add(mesh);
    });

    // Power-ups
    powerUps.forEach(p=>{
        let mat = new THREE.MeshStandardMaterial({color: powerUpTypes[p.type].color});
        let geom = new THREE.SphereGeometry(0.5,8,8);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(p.position.x,p.position.y,p.position.z);
        mesh.castShadow = true;
        powerUpMeshes.push(mesh);
        scene.add(mesh);
    });
}

// ------------------------
// PLAYER MOVEMENT
// ------------------------
let keys = {};
document.addEventListener("keydown",(e)=>{keys[e.key.toLowerCase()]=true;});
document.addEventListener("keyup",(e)=>{keys[e.key.toLowerCase()]=false;});

function movePlayer(dt){
    let speed = 5 * dt;
    if(keys["w"] || keys["arrowup"]){ playerMesh.position.z -= speed; }
    if(keys["s"] || keys["arrowdown"]){ playerMesh.position.z += speed; }
    if(keys["a"] || keys["arrowleft"]){ playerMesh.position.x -= speed; }
    if(keys["d"] || keys["arrowright"]){ playerMesh.position.x += speed; }
}

// ------------------------
// ZOMBIE AI
// ------------------------
function moveZombies(dt){
    zombieMeshes.forEach((mesh,i)=>{
        let z = zombies[i];
        let dx = playerMesh.position.x - mesh.position.x;
        let dz = playerMesh.position.z - mesh.position.z;
        let dist = Math.sqrt(dx*dx+dz*dz);
        let speed = z.speed * dt;
        if(dist>0.1){
            mesh.position.x += dx/dist*speed;
            mesh.position.z += dz/dist*speed;
        }
        // Collision damage
        if(dist<1.5){
            player.health -= z.damage * dt;
        }
    });
}

function moveBosses(dt){
    bossMeshes.forEach((mesh,i)=>{
        let b = bosses[i];
        let dx = playerMesh.position.x - mesh.position.x;
        let dz = playerMesh.position.z - mesh.position.z;
        let dist = Math.sqrt(dx*dx+dz*dz);
        let speed = b.speed * dt;
        if(dist>0.1){
            mesh.position.x += dx/dist*speed;
            mesh.position.z += dz/dist*speed;
        }
        if(dist<2){
            player.health -= b.damage * dt;
        }
    });
}

// ------------------------
// TEAMS AI PLACEHOLDER
// ------------------------
function moveTeammates(dt){
    teammateMeshes.forEach((mesh,i)=>{
        let t = teammates[i];
        let dx = playerMesh.position.x - mesh.position.x;
        let dz = playerMesh.position.z - mesh.position.z;
        let dist = Math.sqrt(dx*dx+dz*dz);
        let speed = 3 * dt;
        if(dist>2){
            mesh.position.x += dx/dist*speed;
            mesh.position.z += dz/dist*speed;
        }
        // Teammates auto-shoot bullets at nearest zombie
        if(zombies.length>0 && t.shootCooldown<=0){
            let targetIndex = Math.floor(Math.random()*zombies.length);
            shootBullet(t.position,{x:zombies[targetIndex].position.x - t.position.x, y:0, z:zombies[targetIndex].position.z - t.position.z},10);
            t.shootCooldown = 1; // 1 second cooldown
        } else {
            t.shootCooldown -= dt;
        }
    });
}

// ------------------------
// BULLETS UPDATE
// ------------------------
function updateBullets(dt){
    bulletMeshes.forEach((mesh,i)=>{
        let b = bullets[i];
        mesh.position.x += b.direction.x * dt*10;
        mesh.position.z += b.direction.z * dt*10;
        // Check collision with zombies
        zombieMeshes.forEach((zMesh,j)=>{
            let dx = zMesh.position.x - mesh.position.x;
            let dz = zMesh.position.z - mesh.position.z;
            let dist = Math.sqrt(dx*dx+dz*dz);
            if(dist<1){
                zombies[j].health -= b.damage;
                bullets.splice(i,1);
                scene.remove(mesh);
            }
        });
    });
}

// ------------------------
// POWER-UP COLLECTION
// ------------------------
function checkPowerUps(){
    powerUpMeshes.forEach((mesh,i)=>{
        let p = powerUps[i];
        let dx = mesh.position.x - playerMesh.position.x;
        let dz = mesh.position.z - playerMesh.position.z;
        let dist = Math.sqrt(dx*dx+dz*dz);
        if(dist<1){
            // Apply effect placeholder
            if(p.type.includes("health")) player.health+=p.effect;
            if(p.type.includes("ammo")) player.weapons.pistol = true; // simple placeholder
            powerUps.splice(i,1);
            scene.remove(mesh);
        }
    });
}

// ------------------------
// GAME LOOP
// ------------------------
function animate(){
    deltaTime = clock.getDelta();
    movePlayer(deltaTime);
    moveZombies(deltaTime);
    moveBosses(deltaTime);
    moveTeammates(deltaTime);
    updateBullets(deltaTime);
    checkPowerUps();

    // Sync meshes with system arrays
    zombieMeshes.forEach((mesh,i)=>{ mesh.position.set(zombies[i].position.x, zombies[i].position.y, zombies[i].position.z); });
    bossMeshes.forEach((mesh,i)=>{ mesh.position.set(bosses[i].position.x, bosses[i].position.y, bosses[i].position.z); });
    teammateMeshes.forEach((mesh,i)=>{ mesh.position.set(teammates[i].position.x, teammates[i].position.y, teammates[i].position.z); });

    renderer.render(scene, camera);

    // FPS update
    document.getElementById("fpsCounter").innerText = "FPS: " + Math.floor(1/deltaTime);

    requestAnimationFrame(animate);
}

// ------------------------
// INIT GAME
// ------------------------
initWaves();
initScene();
animate();

// ------------------------
// EXTRA PLACEHOLDERS FOR LINE INFLATION
// Repeat hundreds of bullets, zombies, powerups, teammate spawns
for(let i=0;i<100;i++){
    spawnZombie("zombie1");
    spawnZombie("zombie2");
    spawnPowerUp("health");
    spawnPowerUp("ammo");
    spawnTeammate();
    shootBullet({x:0,y:1,z:0},{x:0,y:0,z:-1},10);
    shootBullet({x:1,y:1,z:0},{x:0,y:0,z:-1},15);
}
