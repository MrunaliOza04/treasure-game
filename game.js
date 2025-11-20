const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let hotspots = [
  { x: 200, y: 500, r: 40, msg: "You found some shiny gems!" },
  { x: 350, y: 420, r: 40, msg: "You discovered the hidden hut!" },
  { x: 500, y: 510, r: 40, msg: "You found ancient stones!" },
  { x: 300, y: 600, r: 40, msg: "You found treasure clues near the fire!" }
];

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  hotspots.forEach(h => {
    const dist = Math.sqrt((mouseX - h.x) ** 2 + (mouseY - h.y) ** 2);
    if (dist < h.r) {
      alert(h.msg);
    }
  });
});

// simple star twinkle animation
let stars = [
  { x: 80, y: 80, alpha: 1, dir: -0.02 },
  { x: 160, y: 110, alpha: 1, dir: -0.015 }
];

function animateStars() {
  ctx.clearRect(0, 0, 700, 700);

  // background image already handled by CSS
  // draw stars
  stars.forEach(s => {
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();

    s.alpha += s.dir;
    if (s.alpha <= 0.2 || s.alpha >= 1) s.dir *= -1;
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(animateStars);
}

animateStars();
