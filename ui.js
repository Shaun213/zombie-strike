function updateHUD(){
  document.getElementById("moneyDisplay").innerText="Money: $"+Math.floor(player.money);
  document.getElementById("scoreDisplay").innerText="Score: "+Math.floor(player.score);
  document.getElementById("waveDisplay").innerText="Wave: "+waveNumber;
  document.getElementById("healthDisplay").innerText="Health: "+Math.floor(player.health);
  let activePowerUps = powerUps.map(p=>p.type).join(",")||"None";
  document.getElementById("powerUpDisplay").innerText="Power-ups: "+activePowerUps;
}
document.getElementById("buyTeammateBtn").onclick=()=>{if(player.money>=100){spawnTeammate();player.money-=100;}}
document.getElementById("buyWeaponPistolBtn").onclick=()=>{if(player.money>=50){player.weapons.pistol=true;player.money-=50;}}
document.getElementById("buyWeaponRifleBtn").onclick=()=>{if(player.money>=200){player.weapons.rifle=true;player.money-=200;}}
document.getElementById("buyWeaponMeleeBtn").onclick=()=>{if(player.money>=100){player.weapons.melee=true;player.money-=100;}}

function uiLoop(){updateHUD(); requestAnimationFrame(uiLoop);}
uiLoop();
