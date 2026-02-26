// ----------------------------
// UI.JS - HUD & INTERACTIONS
// ----------------------------

// ----------------------------
// GET HUD ELEMENTS
// ----------------------------
const fpsCounter = document.getElementById("fpsCounter");
const moneyDisplay = document.getElementById("moneyDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const waveDisplay = document.getElementById("waveDisplay");
const healthDisplay = document.getElementById("healthDisplay");
const powerUpDisplay = document.getElementById("powerUpDisplay");

const buyTeammateBtn = document.getElementById("buyTeammateBtn");
const buyWeaponPistolBtn = document.getElementById("buyWeaponPistolBtn");
const buyWeaponRifleBtn = document.getElementById("buyWeaponRifleBtn");
const buyWeaponMeleeBtn = document.getElementById("buyWeaponMeleeBtn");

// ----------------------------
// BUY BUTTON EVENTS
// ----------------------------
buyTeammateBtn.onclick = ()=>{
    if(player.money>=100){
        player.money-=100;
        spawnTeammate();
    }
};

buyWeaponPistolBtn.onclick = ()=>{
    if(player.money>=50){
        player.money-=50;
        player.weapons.pistol=true;
    }
};

buyWeaponRifleBtn.onclick = ()=>{
    if(player.money>=200){
        player.money-=200;
        player.weapons.rifle=true;
    }
};

buyWeaponMeleeBtn.onclick = ()=>{
    if(player.money>=100){
        player.money-=100;
        player.weapons.melee=true;
    }
};

// ----------------------------
// FPS COUNTER
// ----------------------------
let fpsHistory = [];
function updateFPS(){
    const fps = 1/deltaTime;
    fpsHistory.push(fps);
    if(fpsHistory.length>20) fpsHistory.shift();
    const avg = Math.round(fpsHistory.reduce((a,b)=>a+b)/fpsHistory.length);
    fpsCounter.innerText = "FPS: " + avg;
}

// ----------------------------
// UPDATE HUD
// ----------------------------
function updateHUD(){
    moneyDisplay.innerText = "Money: " + Math.floor(player.money);
    scoreDisplay.innerText = "Score: " + player.score;
    waveDisplay.innerText = "Wave: " + waveNumber;
    healthDisplay.innerText = "Health: " + Math.floor(player.health) + "/" + player.maxHealth;

    if(powerUps.length>0){
        powerUpDisplay.innerText = "Power-ups: " + powerUps.map(p=>p.type).join(", ");
    } else powerUpDisplay.innerText = "Power-ups: None";
}

// ----------------------------
// AUTOMATIC HUD UPDATE
// ----------------------------
function animateHUD(){
    updateFPS();
    updateHUD();
    requestAnimationFrame(animateHUD);
}

animateHUD();
