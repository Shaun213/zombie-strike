let scene,camera,renderer,clock,deltaTime,playerMesh;
let keys={w:false,a:false,s:false,d:false};

function startGame(){
    scene=new THREE.Scene();
    scene.background=new THREE.Color(0x87ceeb);
    camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.set(0,10,20);
    camera.lookAt(0,0,0);

    renderer=new THREE.WebGLRenderer({canvas:document.getElementById("gameCanvas")});
    renderer.setSize(window.innerWidth,window.innerHeight);

    clock=new THREE.Clock();

    initPlayer(); initLights();
    spawnNextWave();

    animate();
}

// PLAYER
function initPlayer(){let geom=new THREE.BoxGeometry(1,2,1);let mat=new THREE.MeshStandardMaterial({color:document.getElementById("avatarColor").value});playerMesh=new THREE.Mesh(geom,mat);playerMesh.position.copy(player.position);scene.add(playerMesh);}

// LIGHTS
function initLights(){let dir=new THREE.DirectionalLight(0xffffff,1);dir.position.set(10,20,10);scene.add(dir);scene.add(new THREE.AmbientLight(0xffffff,0.3));}

// CONTROLS
document.addEventListener("keydown",(e)=>{if(e.key=="w")keys.w=true;if(e.key=="s")keys.s=true;if(e.key=="a")keys.a=true;if(e.key=="d")keys.d=true;if(e.key=="1")player.currentWeapon="pistol";if(e.key=="2")player.currentWeapon="rifle";if(e.key=="3")player.currentWeapon="melee";});
document.addEventListener("keyup",(e)=>{if(e.key=="w")keys.w=false;if(e.key=="s")keys.s=false;if(e.key=="a")keys.a=false;if(e.key=="d")keys.d=false;});

// SHOOT
document.addEventListener("click",()=>{let dir={x:0,y:0,z:-1};if(player.currentWeapon=="pistol"&&player.weapons.pistol)shootBullet(player.position,dir,weaponUpgrades.pistol.damage);if(player.currentWeapon=="rifle"&&player.weapons.rifle)shootBullet(player.position,dir,weaponUpgrades.rifle.damage);if(player.currentWeapon=="melee"&&player.weapons.melee){if(zombies.length>0)zombies[0].health-=weaponUpgrades.melee.damage;}});

// MOVE PLAYER
function movePlayer(){if(keys.w)player.position.z-=player.speed*deltaTime;if(keys.s)player.position.z+=player.speed*deltaTime;if(keys.a)player.position.x-=player.speed*deltaTime;if(keys.d)player.position.x+=player.speed*deltaTime;playerMesh.position.copy(player.position);}

// CREATE MESHES
function createZombieMesh(z){let g=new THREE.BoxGeometry(1,2,1);let m=new THREE.MeshStandardMaterial({color:zombieTypes[z.type].color});z.mesh=new THREE.Mesh(g,m);z.mesh.position.copy(z.position);scene.add(z.mesh);}
function createBossMesh(b){let g=new THREE.BoxGeometry(3,4,3);let m=new THREE.MeshStandardMaterial({color:zombieTypes[b.type].color});b.mesh=new THREE.Mesh(g,m);b.mesh.position.copy(b.position);scene.add(b.mesh);}
function createTeammateMesh(tm){let g=new THREE.BoxGeometry(1,2,1);let m=new THREE.MeshStandardMaterial({color:0x00ff00});tm.mesh=new THREE.Mesh(g,m);tm.mesh.position.copy(tm.position);scene.add(tm.mesh);}
function createPowerUpMesh(pu){let g=new THREE.SphereGeometry(0.5,16,16);let m=new THREE.MeshStandardMaterial({color:0xffff00});pu.mesh=new THREE.Mesh(g,m);pu.mesh.position.copy(pu.position);scene.add(pu.mesh);}

// UPDATE
function updateZombies(){zombies.forEach((z,i)=>{if(!z.mesh)createZombieMesh(z);let dx=player.position.x-z.position.x;let dz=player.position.z-z.position.z;let dist=Math.sqrt(dx*dx+dz*dz);z.position.x+=(dx/dist)*z.speed*deltaTime;z.position.z+=(dz/dist)*z.speed*deltaTime;if(dist<1.5)player.health-=z.damage*deltaTime;if(z.health<=0){scene.remove(z.mesh);zombies.splice(i,1);player.money+=10;player.score+=10;}z.mesh.position.copy(z.position);});bosses.forEach((b,i)=>{if(!b.mesh)createBossMesh(b);let dx=player.position.x-b.position.x;let dz=player.position.z-b.position.z;let dist=Math.sqrt(dx*dx+dz*dz);b.position.x+=(dx/dist)*b.speed*deltaTime;b.position.z+=(dz/dist)*b.speed*deltaTime;if(dist<2)player.health-=b.damage*deltaTime;if(b.health<=0){scene.remove(b.mesh);bosses.splice(i,1);player.money+=100;player.score+=100;bossSpawned=false;}b.mesh.position.copy(b.position);});}

function updateTeammates(){teammates.forEach(tm=>{if(!tm.mesh)createTeammateMesh(tm);let dx=player.position.x-tm.position.x;let dz=player.position.z-tm.position.z;let dist=Math.sqrt(dx*dx+dz*dz);if(dist>3){tm.position.x+=dx*deltaTime*2;tm.position.z+=dz*deltaTime*2;}if(tm.shootCooldown<=0&&zombies.length>0){let nearest=zombies.reduce((a,b)=>(Math.hypot(b.position.x-tm.position.x,b.position.z-tm.position.z)<Math.hypot(a.position.x-tm.position.x,a.position.z-tm.position.z)?b:a));shootBullet(tm.position,{x:nearest.position.x-tm.position.x,y:0,z:nearest.position.z-tm.position.z},weaponUpgrades.pistol.damage);tm.shootCooldown=1;}else tm.shootCooldown-=deltaTime;tm.mesh.position.copy(tm.position);});}

function updateBullets(){bullets.forEach((b,i)=>{b.position.x+=b.direction.x*10*deltaTime;b.position.y+=b.direction.y*10*deltaTime;b.position.z+=b.direction.z*10*deltaTime;zombies.forEach((z,j)=>{let dist=Math.sqrt((b.position.x-z.position.x)**2+(b.position.z-z.position.z)**2);if(dist<1){z.health-=b.damage;bullets.splice(i,1);}});bosses.forEach((b2,j)=>{let dist=Math.sqrt((b.position.x-b2.position.x)**2+(b.position.z-b2.position.z)**2);if(dist<1){b2.health-=b.damage;bullets.splice(i,1);}});});}

function updatePowerUps(){powerUps.forEach(pu=>{if(!pu.mesh)createPowerUpMesh(pu);pu.mesh.position.copy(pu.position);});collectPowerUps();}

// ANIMATE
function animate(){deltaTime=clock.getDelta();movePlayer();updateZombies();updateTeammates();updateBullets();updatePowerUps();renderer.render(scene,camera);requestAnimationFrame(animate);}
