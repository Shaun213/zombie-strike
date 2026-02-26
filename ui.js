// ui.js
const fpsCounter = document.getElementById("fpsCounter");
let showFPS = true;
let lastTime = performance.now();
let frame=0;
let fps=0;

// Update HUD
function drawHUD(){
  ctx.fillStyle="#fff";
  ctx.font="16px sans-serif";
  ctx.fillText(`Health: ${player.health}`,10,20);
  ctx.fillText(`Money: $${money}`,10,40);
  ctx.fillText(`Score: ${score}`,10,60);
  ctx.fillText(`Wave: ${waveNumber}`,10,80);
  if(showFPS) ctx.fillText(`FPS: ${fps}`,10,100);
}

// FPS counter
function updateFPS(){
  frame++;
  const now = performance.now();
  if(now-lastTime>=1000){
    fps=frame;
    frame=0;
    lastTime=now;
  }
}

// Shop UI
document.getElementById("buyTeammateBtn").onclick = ()=>{
  if(money>=100){
    money-=100;
    teammates.push({x:player.x+50,y:player.y, size:20, bullets:[], shootCooldown:0});
  }
};

// Settings UI
document.getElementById("fpsToggle").onchange = (e)=>{
  showFPS=e.target.checked;
};

// Start Game Button
document.getElementById("startGameBtn").onclick = ()=>{
  player.color=document.getElementById("avatarColor").value;
  const mode=document.getElementById("gameMode").value;
  document.getElementById("menu").style.display="none";
  gameLoop();
};
