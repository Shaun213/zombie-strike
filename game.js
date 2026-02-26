// game.js
let scene, camera, renderer, player, bullets=[], clock=new THREE.Clock();
let shootCooldown=0;

function init3D(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
  camera.position.set(0,20,30);
  camera.lookAt(0,0,0);
  renderer = new THREE.WebGLRenderer({canvas: document.getElementById("gameCanvas")});
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.DirectionalLight(0xffffff,0.8);
  light.position.set(10,20,10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff,0.6));

  const geometry = new THREE.BoxGeometry(2,2,2);
  const material = new THREE.MeshStandardMaterial({color:0x00ff00});
  player = new THREE.Mesh(geometry,material);
  player.position.set(0,1,0);
  player.health=100;
  scene.add(player);

  const groundGeom = new THREE.PlaneGeometry(200,200);
  const groundMat = new THREE.MeshStandardMaterial({color:0x228B22});
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  animate3D();
}

let keys = {};
document.addEventListener("keydown", e=>{ keys[e.key]=true; });
document.addEventListener("keyup", e=>{ keys[e.key]=false; });

function updatePlayer3D(delta){
  const speed = 10*delta;
  if(keys['w']) player.position.z -= speed;
  if(keys['s']) player.position.z += speed;
  if(keys['a']) player.position.x -= speed;
  if(keys['d']) player.position.x += speed;

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 30;
  camera.lookAt(player.position);

  if(keys[' '] && shootCooldown<=0){
    shootBullet3D();
    shootCooldown=0.2;
  }
  if(shootCooldown>0) shootCooldown-=delta;
}

function shootBullet3D(){
  const geom = new THREE.SphereGeometry(0.3,8,8);
  const mat = new THREE.MeshStandardMaterial({color:0xffff00});
  const b = new THREE.Mesh(geom, mat);
  b.position.copy(player.position);
  b.direction = new THREE.Vector3(0,0,-1);
  scene.add(b);
  bullets.push(b);
}

function updateBullets3D(delta){
  bullets.forEach((b,i)=>{
    b.position.add(b.direction.clone().multiplyScalar(20*delta));
    zombies.forEach((z,zi)=>{
      if(b.position.distanceTo(z.position)<1.5){
        z.health-=15;
        scene.remove(b);
        bullets.splice(i,1);
        if(z.health<=0){
          money+=z.boss?50:10;
          score+=z.boss?100:10;
          scene.remove(z);
          zombies.splice(zi,1);
          if(z.boss) bossSpawned=false;
        }
      }
    });
  });
}

function updateZombies3D(delta){
  zombies.forEach((z,i)=>{
    const dir = new THREE.Vector3().subVectors(player.position,z.position).normalize();
    z.position.add(dir.multiplyScalar(z.speed*delta));
    if(player.position.distanceTo(z.position)<2){
      player.health-=10;
      scene.remove(z);
      zombies.splice(i,1);
    }
  });
}

function updateTeammates3D(delta){
  spawnTeammates(player);
  teammates.forEach(tm=>{
    tm.bullets.forEach((b,i)=>{
      b.position.add(b.direction.clone().multiplyScalar(20*delta));
      zombies.forEach((z,zi)=>{
        if(b.position.distanceTo(z.position)<1.5){
          z.health-=10;
          scene.remove(b);
          tm.bullets.splice(i,1);
          if(z.health<=0){
            money+=z.boss?50:10;
            score+=z.boss?100:10;
            scene.remove(z);
            zombies.splice(zi,1);
          }
        }
      });
    });
  });
}

function animate3D(){
  requestAnimationFrame(animate3D);
  const delta = clock.getDelta();
  updatePlayer3D(delta);
  updateBullets3D(delta);
  updateZombies3D(delta);
  updateTeammates3D(delta);
  updateWaves();
  renderer.render(scene,camera);
}
