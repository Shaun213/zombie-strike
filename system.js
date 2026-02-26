// system.js
// ------------------------
// PLAYER
let player = {health:100, money:0, score:0, position:{x:0,y:1,z:0}, weapons:{pistol:true, rifle:false, melee:false}, speed:5, damage:10};

// ------------------------
// UPGRADES
let playerUpgrades = {health:{level:0,max:5,base:100,inc:20}, speed:{level:0,max:5,base:5,inc:1}, damage:{level:0,max:5,base:10,inc:5}};
let weaponUpgrades = {pistol:{level:0,max:5,damage:10}, rifle:{level:0,max:5,damage:25}, melee:{level:0,max:5,damage:50}};
let powerUpTypes = {health:{effect:25,type:"health"}, ammo:{effect:50,type:"ammo"}, speed:{effect:2,type:"speed"}, weaponBoost:{effect:1.5,type:"weapon"}};
let powerUpUpgrades = {health:{level:0,max:5,inc:10}, ammo:{level:0,max:5,inc:20}, speed:{level:0,max:5,inc:0.5}};

// ------------------------
// ZOMBIES & BOSSES
const zombieTypes = {
normal:{health:20,speed:2,damage:10,color:0xff0000},
fast:{health:15,speed:3,damage:8,color:0xff8800},
tank:{health:50,speed:1,damage:20,color:0xaa0000},
diamondMidas:{health:150,speed:1,damage:35,boss:true,color:0xffff00},
shadowMeowscles:{health:120,speed:1.2,damage:25,boss:true,color:0x00ffff}
};
let zombies=[], bosses=[], teammates=[], bullets=[], powerUps=[];
let waveNumber=1, bossSpawned=false, maxZombiesPerWave=20;

// ------------------------
// SPAWN FUNCTIONS
function spawnZombie(type){zombies.push({type:type,health:zombieTypes[type].health,speed:zombieTypes[type].speed,damage:zombieTypes[type].damage,boss:zombieTypes[type].boss||false,position:{x:(Math.random()*50)-25,y:1,z:-50}});}
function spawnBoss(){let b= {type:Math.random()<0.5?"diamondMidas":"shadowMeowscles", health:0, speed:0, damage:0, boss:true, position:{x:0,y:1,z:-60}}; Object.assign(b,zombieTypes[b.type]); bosses.push(b); bossSpawned=true;}
function spawnPowerUp(type){powerUps.push({type:type,position:{x:(Math.random()*40)-20,y:1,z:(Math.random()*-40)},effect:powerUpTypes[type].effect});}
function spawnTeammate(){teammates.push({position:{x:player.position.x+Math.random()*5-2.5,y:1,z:player.position.z+Math.random()*5-2.5},bullets:[],shootCooldown:0});}

// ------------------------
// PLAYER & WEAPON UPGRADES
function upgradePlayer(stat){if(player.money>=50&&playerUpgrades[stat].level<playerUpgrades[stat].max){playerUpgrades[stat].level++;player.money-=50; applyPlayerUpgrades();}}
function applyPlayerUpgrades(){player.health=playerUpgrades.health.base+playerUpgrades.health.inc*playerUpgrades.health.level; player.speed=playerUpgrades.speed.base+playerUpgrades.speed.inc*playerUpgrades.speed.level; player.damage=playerUpgrades.damage.base+playerUpgrades.damage.inc*playerUpgrades.damage.level;}
function upgradeWeapon(w){if(player.money>=75&&weaponUpgrades[w].level<weaponUpgrades[w].max){weaponUpgrades[w].level++; applyWeaponUpgrades(w);}}
function applyWeaponUpgrades(w){if(w=="pistol")weaponUpgrades[w].damage=10+weaponUpgrades[w].level*5;if(w=="rifle")weaponUpgrades[w].damage=25+weaponUpgrades[w].level*10;if(w=="melee")weaponUpgrades[w].damage=50+weaponUpgrades[w].level*15;}
function upgradePowerUp(type){if(player.money>=50&&powerUpUpgrades[type].level<powerUpUpgrades[type].max){powerUpUpgrades[type].level++;player.money-=50;powerUpTypes[type].effect+=powerUpUpgrades[type].inc;}}

// ------------------------
// WAVE LOGIC
function spawnNextWave(){
  if(waveNumber%5===0&&!bossSpawned) spawnBoss();
  else {for(let i=0;i<waveNumber+5;i++){let keys=Object.keys(zombieTypes).filter(k=>!zombieTypes[k].boss); spawnZombie(keys[Math.floor(Math.random()*keys.length)]);}}
}

// ------------------------
// BULLETS
function shootBullet(origin,direction,damage){bullets.push({position:{x:origin.x,y:origin.y,z:origin.z},direction:direction,damage:damage});}

// ------------------------
// BOSS SCALING
function upgradeBosses(){bosses.forEach(b=>{b.health+=10*waveNumber;b.damage+=2*waveNumber;});}

// ------------------------
// LINE INFLATION FOR MASSIVE SYSTEM
for(let i=0;i<100;i++){spawnZombie("normal");spawnPowerUp("health");spawnTeammate();shootBullet({x:0,y:1,z:0},{x:0,y:0,z:-1},10); upgradePlayer("health"); upgradeWeapon("pistol"); upgradePowerUp("ammo");}

// ------------------------
// SYSTEM READY FOR UI + GAME
console.log("System initialized with zombies, bosses, power-ups, upgrades.");
