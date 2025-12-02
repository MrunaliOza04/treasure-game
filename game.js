// game.js — Treasure Escape (player: Mogli-like sprite)
const SPRITE_URL = "player.png";   // ✅ FIXED — this loads from your GitHub repo

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const keyCountEl = document.getElementById('key-count');
const statusEl = document.getElementById('status');
const winOverlay = document.getElementById('win');
const restartBtn = document.getElementById('restart');

let keys = { left: false, right: false, up: false, down: false };
let player = { x: 120, y: 420, w: 34, h: 44, speed: 2.8 };
let hasKey = false;
let chestOpened = false;

const scale = 700/400;
function s(n){ return n * scale; }

const keyObj = { x: s(320), y: s(200), r: s(8), taken:false };
const chest = { x: s(320), y: s(260), w: s(36), h: s(22), opened:false };

const obstacles = [
  {x:s(150), y:s(285), rx:s(18), ry:s(10)},
  {x:s(250), y:s(300), rx:s(12), ry:s(7)},
  {x:s(170), y:s(310), rx:s(9), ry:s(5)},
  {x:s(260), y:s(275), rx:s(16), ry:s(9)}
];

const gemPositions = [
  {x:s(200), y:s(270), r:s(6), collected:false},
  {x:s(225), y:s(285), r:s(5), collected:false},
  {x:s(175), y:s(285), r:s(5.5), collected:false}
];

let gemsCollected = 0;

// player sprite
const playerImg = new Image();
playerImg.src = SPRITE_URL;
playerImg.onerror = () => console.warn("⚠ Player image failed to load!");

// KEYBOARD INPUT
window.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft') keys.left = true;
  if(e.key === 'ArrowRight') keys.right = true;
  if(e.key === 'ArrowUp') keys.up = true;
  if(e.key === 'ArrowDown') keys.down = true;
});
window.addEventListener('keyup', e => {
  if(e.key === 'ArrowLeft') keys.left = false;
  if(e.key === 'ArrowRight') keys.right = false;
  if(e.key === 'ArrowUp') keys.up = false;
  if(e.key === 'ArrowDown') keys.down = false;
});

// RESET
function resetGame(){
  player.x = s(120); 
  player.y = s(420);
  hasKey = false; 
  keyObj.taken = false;
  chest.opened = false;
  gemsCollected = 0;

  gemPositions.forEach(g => g.collected = false);

  keyCountEl.textContent = 0;
  statusEl.textContent = "Find the key, then reach the chest!";
  winOverlay.classList.add('hidden');
}

// UPDATE LOOP
function update(){
  let vx = 0, vy = 0;
  if(keys.left) vx = -player.speed;
  if(keys.right) vx = player.speed;
  if(keys.up) vy = -player.speed;
  if(keys.down) vy = player.speed;

  player.x += vx;
  player.y += vy;

  // PICK UP KEY
  if(!keyObj.taken){
    const d = Math.hypot(player.x - keyObj.x, player.y - keyObj.y);
    if(d < s(18)){
      keyObj.taken = true;
      hasKey = true;
      keyCountEl.textContent = 1;
      statusEl.textContent = "You picked up the key! Now go to the chest.";
    }
  }

  // OPEN CHEST
  if(hasKey && !chest.opened){
    if(Math.abs(player.x - chest.x) < s(28) && Math.abs(player.y - chest.y) < s(20)){
      chest.opened = true;
      statusEl.textContent = "Chest unlocked! You escaped with the treasure!";
      setTimeout(() => winOverlay.classList.remove("hidden"), 500);
    }
  }
}

// DRAW LOOP
function draw(){
  ctx.clearRect(0,0,W,H);

  // draw player sprite
  if(playerImg.complete && playerImg.naturalWidth > 0){
    ctx.drawImage(
      playerImg,
      player.x - player.w/2,
      player.y - player.h/2,
      player.w,
      player.h
    );
  } else {
    // fallback if PNG missing
    ctx.fillStyle = "#f1d6a8";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 12, 0, Math.PI*2);
    ctx.fill();
  }
}

// MAIN LOOP
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

restartBtn.addEventListener('click', resetGame);

resetGame();
loop();







