// game.js — Treasure Escape (player: Mogli-like sprite)
// Player sprite is loaded from the uploaded file path (the environment will convert local path to public URL)
const SPRITE_URL = "/mnt/data/Screenshot 2025-11-19 194846.png"; // <--- local path you uploaded

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

// Game objects (positions on the 700px canvas but using the 400 viewBox art scale -> adjusted)
const scale = 700/400; // we used 400 viewBox for SVG, scale to 700 canvas
function s(n){ return n * scale; }

const keyObj = { x: s(320), y: s(200), r: s(8), taken:false };    // key location
const chest = { x: s(320), y: s(260), w: s(36), h: s(22), opened:false }; // chest
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

// load player sprite
const playerImg = new Image();
playerImg.src = SPRITE_URL;
playerImg.onload = ()=>{ /* ok */ };
playerImg.onerror = ()=>{ console.warn("Player sprite failed to load; fallback will draw circle."); };

// input handlers
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

// utility
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

function rectCircleColl(px, py, rw, rh, cx, cy, cr){
  // find closest point
  const closestX = Math.max(px - rw/2, Math.min(cx, px + rw/2));
  const closestY = Math.max(py - rh/2, Math.min(cy, py + rh/2));
  const dx = cx - closestX, dy = cy - closestY;
  return (dx*dx + dy*dy) < (cr*cr);
}

function resetGame(){
  player.x = s(120); player.y = s(420); hasKey=false; keyObj.taken=false;
  chest.opened=false; chestOpened=false; gemsCollected=0;
  gemPositions.forEach(g=> g.collected=false);
  keyCountEl.textContent = hasKey?1:0;
  statusEl.textContent = "Find the key, then reach the chest!";
  winOverlay.classList.add('hidden');
}

// game loop
function update(){
  // move
  let vx = 0, vy = 0;
  if(keys.left) vx = -player.speed;
  if(keys.right) vx = player.speed;
  if(keys.up) vy = -player.speed;
  if(keys.down) vy = player.speed;

  // simple collision with island boundary (ellipse)
  const nextX = player.x + vx;
  const nextY = player.y + vy;
  const dx = nextX - s(200);
  const dy = nextY - s(260);
  // ellipse formula (x^2/a^2 + y^2/b^2 <=1)
  const a = s(120), b = s(40);
  if(((dx*dx)/(a*a) + (dy*dy)/(b*b)) < 0.95){
    player.x = nextX;
    player.y = nextY;
  }

  // collect key
  if(!keyObj.taken){
    const d = Math.hypot(player.x - keyObj.x, player.y - keyObj.y);
    if(d < s(18)){
      keyObj.taken = true; hasKey = true;
      keyCountEl.textContent = 1;
      statusEl.textContent = "You picked up the key! Now go to the chest.";
      // small flash
    }
  }

  // chest unlocking
  if(hasKey && !chest.opened){
    // collision with chest region
    if(Math.abs(player.x - chest.x) < s(28) && Math.abs(player.y - chest.y) < s(20)){
      chest.opened = true; chestOpened = true;
      statusEl.textContent = "Chest unlocked! You escaped with the treasure!";
      setTimeout(()=> showWin(), 600);
    }
  }

  // gems collection (extra)
  gemPositions.forEach(g=>{
    if(!g.collected){
      const d = Math.hypot(player.x - g.x, player.y - g.y);
      if(d < s(14)){
        g.collected = true;
        gemsCollected++;
      }
    }
  });
}

function showWin(){
  winOverlay.classList.remove('hidden');
}

// drawing
function draw(){
  // clear
  ctx.clearRect(0,0,W,H);

  // (background is CSS image) draw overlay decorations if needed
  // draw obstacles (stones)
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#7b7b7b';
  obstacles.forEach(o=>{
    ctx.beginPath();
    ctx.ellipse(o.x, o.y, o.rx, o.ry, 0, 0, Math.PI*2);
    ctx.fill();
  });

  // draw gems
  gemPositions.forEach(g=>{
    if(!g.collected){
      ctx.fillStyle = '#90c8ff';
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(g.x - g.r*0.3, g.y - g.r*0.3, g.r*0.4, 0, Math.PI*2); ctx.fill();
    }
  });

  // draw key (if not taken)
  if(!keyObj.taken){
    ctx.fillStyle = '#f1d6a8';
    ctx.beginPath(); ctx.arc(keyObj.x, keyObj.y, keyObj.r, 0, Math.PI*2); ctx.fill();
  }

  // draw chest (closed or open)
  if(!chest.opened){
    ctx.fillStyle = '#3f2e1a';
    ctx.fillRect(chest.x - chest.w/2, chest.y - chest.h/2, chest.w, chest.h);
    ctx.fillStyle = '#bfa077';
    ctx.fillRect(chest.x - chest.w/2 + 4, chest.y - chest.h/2 + 4, chest.w - 8, 6);
  } else {
    // open chest - draw lid and treasures
    ctx.fillStyle = '#3f2e1a';
    ctx.fillRect(chest.x - chest.w/2, chest.y - chest.h/2 + 6, chest.w, chest.h - 6);
    ctx.fillStyle = '#f2d6a3';
    for(let i=0;i<6;i++){
      ctx.beginPath(); ctx.arc(chest.x - chest.w/2 + 8 + i*6, chest.y - chest.h/2 + 2, 3, 0, Math.PI*2); ctx.fill();
    }
  }

  // draw player (sprite or fallback)
  if(playerImg.complete && playerImg.naturalWidth !== 0){
    ctx.drawImage(playerImg, player.x - player.w/2, player.y - player.h/2, player.w, player.h);
  } else {
    // fallback: draw simple Mogli-like silhouette (brown circle + leaf)
    ctx.fillStyle = '#6e4a2e';
    ctx.beginPath(); ctx.arc(player.x, player.y - 6, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f1d6a8';
    ctx.beginPath(); ctx.arc(player.x, player.y + 6, 8, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
}

// main loop
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

restartBtn.addEventListener('click', ()=>{
  resetGame();
});

// initialize positions scaled
player.x = s(120); player.y = s(420);
resetGame();
loop();
