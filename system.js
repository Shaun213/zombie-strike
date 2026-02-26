// system.js
let waveNumber = 1;
let zombies = [];
let bossSpawned = false;
let teammates = [];

const bossWaveInterval = 5;
const zombieTypes = {
  normal: {health:20,speed:1},
  fast: {health:15,speed:2},
  tank: {health:50,speed:0.5},
  diamondMidas: {health:150,speed:1,boss:true},
  shadowMeowscles: {health:120,speed:1.2,boss:true}
};

// Spawn wave logic
function spawnNextWave() {
  if (waveNumber % bossWaveInterval === 0 && !bossSpawned && zombies.length === 0) {
    const bossType = Math.random()<0.5?'diamondMidas':'shadowMeowscles';
    zombies.push({
      x:400,
      y:-60,
      type:bossType,
      health:zombieTypes[bossType].health,
      speed:zombieTypes[bossType].speed,
      size:60,
      boss:true
    });
    bossSpawned = true;
  } else {
    for(let i=0;i<waveNumber+1;i++){
      const types=['normal','fast','tank'];
      const zType = types[Math.floor(Math.random()*types.length)];
      zombies.push({
        x:Math.random()*760,
        y:-40,
        type:zType,
        health:zombieTypes[zType].health,
        speed:zombieTypes[zType].speed,
        size:40,
        boss:false
      });
    }
  }
}

function updateWaves() {
  if(zombies.length===0){
    waveNumber++;
    spawnNextWave();
    bossSpawned=false;
  }
}

// Spawn teammates
function spawnTeammates(player) {
  teammates.forEach(tm=>{
    // Simple AI: follow player, shoot at nearest zombie
    tm.x += (player.x - tm.x)*0.02;
    tm.y += (player.y - tm.y)*0.02;

    // Shoot closest zombie
    if(zombies.length>0 && tm.shootCooldown<=0){
      let target = zombies[0];
      tm.bullets.push({x:tm.x+15,y:tm.y,dx:(target.x-tm.x)/50,dy:(target.y-tm.y)/50});
      tm.shootCooldown = 60; // cooldown
    }
    if(tm.shootCooldown>0) tm.shootCooldown--;
  });
}
