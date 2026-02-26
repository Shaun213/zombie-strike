// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {x:450,y:500,size:30,health:100,color:"#00ff00"};
let bullets = [];
let money = 0;
let score = 0;

let keys = {};

document.addEventListener("keydown", e=>{ keys[e.key]=true; });
document.addEventListener("keyup", e=>{ keys[e.key]=false; });

function updatePlayer(){
  if(keys['ArrowLeft'] && player.x>0) player.x-=5;
  if(keys['ArrowRight'] && player.x<canvas.width-player.size) player.x+=5;
  if(keys['ArrowUp'] && player.y>0) player.y-=5;
  if(keys['ArrowDown'] && player.y<canvas.height-player.size) player.y+=5;

  // Shoot bullets
  if(keys[' '] && shootCooldown<=0){
    bullets.push({x:player.x+player.size/2-5,y:player.y,dx:0,dy:-10});
    shootCooldown=15;
  }
  if(shootCooldown>0) shootCooldown--;
}

let shootCooldown=0;

function updateBullets(){
  bullets.forEach((b,index)=>{
    b.y+=b.dy;
    if(b.y<0) bullets.splice(index,1);
  });
}

// Update zombies and check collisions
function updateZombiesAndTeammates(){
  zombies.forEach((z,index)=>{
    z.y+=z.speed;

    // Collision with player
    if(rectIntersect(player,z)){
      player.health-=10;
      zombies.splice(index,1);
    }

    // Collision with bullets
    bullets.forEach((b,bIndex)=>{
      if(rectIntersect(b,z)){
        z.health-=15;
        bullets.splice(bIndex,1);
        if(z.health<=0){
          money+=z.boss?50:10;
          score+=z.boss?100:10;
          zombies.splice(index,1);
          if(z.boss) bossSpawned=false;
        }
      }
    });
  });

  spawnTeammates(player);

  // Teammate bullets
  teammates.forEach(tm=>{
    tm.bullets.forEach((b,i)=>{
      b.x+=b.dx*10;
      b.y+=b.dy*10;
      zombies.forEach((z,zi)=>{
        if(rectIntersect(b,z)){
          z.health-=10;
          if(z.health<=0){
            money+=z.boss?50:10;
            score+=z.boss?100:10;
            zombies.splice(zi,1);
            if(z.boss) bossSpawned=false;
          }
          tm.bullets.splice(i,1);
        }
      });
    });
  });
}

function rectIntersect(a,b){
  return a.x < b.x+b.size && a.x+a.size>b.x && a.y < b.y+b.size && a.y+a.size>b.y;
}

function drawEverything(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x,player.y,player.size,player.size);

  // Bullets
  ctx.fillStyle = "#ff0";
  bullets.forEach(b=>ctx.fillRect(b.x,b.y,10,20));

  // Zombies
  zombies.forEach(z=>{
    ctx.fillStyle = z.boss?"#f00":"#a00";
    ctx.fillRect(z.x,z.y,z.size,z.size);
  });

  // Teammates
  teammates.forEach(tm=>{
    ctx.fillStyle = "#0ff";
    ctx.fillRect(tm.x,tm.y,tm.size,tm.size);
    // Teammate bullets
    ctx.fillStyle = "#ff0";
    tm.bullets.forEach(b=>ctx.fillRect(b.x,b.y,5,10));
  });
}
function gameLoop(){
  requestAnimationFrame(gameLoop);
  updatePlayer();
  updateBullets();
  updateZombiesAndTeammates();
  updateWaves();
  drawEverything();
  drawHUD();
  updateFPS();
}
