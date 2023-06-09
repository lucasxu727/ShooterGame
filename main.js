//const for canvas setup
const canvas = document.querySelector("canvas");
const cg = canvas.getContext("2d");
//format setup
canvas.width = innerWidth;
canvas.height = innerHeight;
//CLASS specification on Player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  //DRAW path for player to be displayed
  draw() {
    cg.beginPath();
    cg.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cg.fillStyle = this.color;
    cg.fill();
  }
}

//CLASS specification on projectiles
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  //DRAW path for projectile to be displayed
  draw() {
    cg.beginPath();
    cg.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cg.fillStyle = this.color;
    cg.fill();
  }
  //FUNCTION for updating position of bullet using velocity
  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
//CONST for score
const scoreEl = document.querySelector("#score");
//LET for scoreUpd
let score = 0;
//CONST for parentDiv
const startGame = document.querySelector("#startBtn");
//CONST for startgui
const startGui = document.querySelector("#parentDiv");
//CONST for final score
const finalScore = document.querySelector("#finalScore");

//Friction for  slowing velocity of particles
const friction = 0.99;

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  //DRAW path for projectile to be displayed
  draw() {
    cg.save();
    cg.globalAlpha = this.alpha;
    cg.beginPath();
    cg.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cg.fillStyle = this.color;
    cg.fill();
    cg.restore();
  }
  //FUNCTION for updating position of bullet using velocity
  update() {
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//CLASS specification for enemy projectiles
class Bullet {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  //DRAW path for enemy projectiles
  draw() {
    cg.beginPath();
    cg.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cg.fillStyle = this.color;
    cg.fill();
  }
  //FUNCTION for updating position of bullet using velocity
  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Hitscore {
  constructor(x, y, score, color, velocity) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  //DRAW path for projectile to be displayed
  draw() {
    cg.save();
    cg.globalAlpha = this.alpha;
    cg.beginPath();
    cg.font = "30px Arial";
    cg.fillStyle = this.color;
    cg.fillText(this.score, this.x, this.y);
    cg.restore();
  }
  //FUNCTION for updating position of bullet using velocity
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//player placement, MIGHT CHANGE CONST -> LET
const x = canvas.width / 2;
const y = canvas.height / 2;

//VARIABLE for player creation | uses const x and y for its positioning
let player = new Player(x, y, 25, "white");
//ARRAY creation for projectiles
let projectiles = [];
//ARRAY for creation of bullets
let bullets = [];
//ARRAY for particles
let particles = [];
//ARRAY for hitscore text
let hitscores = [];

//FUNCTIUON INIT for restart gui
function init() {
  player = new Player(x, y, 25, "white");
  projectiles = [];
  bullets = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = 0;
}
//FUNCTION for bullet animate loop
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  //clears the drawings, then updates the most recent drawing so theres no ghost drawings
  cg.fillStyle = "rgba(0, 0, 0, 0.1)";
  cg.fillRect(0, 0, canvas.width, canvas.height);
  //particle spawn
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  //draw player after clearing
  player.draw();
  //draw hitscore
  //remove partilces after they hit zero alpha
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  //remove htiscore
  hitscores.forEach((hitscore, index) => {
    hitscore.update();
    if (hitscore.alpha < 0.1) {
      hitscores.splice(index, 1);
    } else {
      hitscore.update();
    }
  });
  //draw projectile after cleaning
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();
    projectile.draw();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });
  //remove projectiles once off screen
  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();
    //COLLISION detection for player and bullet
    const dist = Math.hypot(player.x - bullet.x, player.y - bullet.y);

    //end game
    if (dist - player.radius - bullet.radius < 1) {
      cancelAnimationFrame(animationId);
      startGui.style.display = "flex";
      finalScore.innerHTML = score;
    }

    //COLLISION WHEN HIT detection for projectile and bullet
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - bullet.x, projectile.y - bullet.y);
      if (dist - projectile.radius - bullet.radius < 1) {
        //Add score
        score += 20;
        scoreEl.innerHTML = score;

        hitscores.push(
          new Hitscore(projectile.x, projectile.y, "20", "white", {
            x: 0,
            y: -1,
          })
        );
        //Particle spawn
        let random2 = Math.round(Math.random() * (5 - 2) + 2);

        for (let i = 0; i < bullet.radius; i++) {
          particles.push(
            new Particle(projectile.x, projectile.y, random2, bullet.color, {
              x: (Math.random() - 0.5) * (Math.random() * 5),
              y: (Math.random() - 0.5) * (Math.random() * 5),
            })
          );
        }
        //FUNCTION for shrinking if circle is too big
        if (bullet.radius >= 20) {
          bullet.radius -= 10;
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          setTimeout(() => {
            bullets.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

//FUNCTION for enemy bullet spawn
setInterval(() => {
  const radius = Math.random() * (40 - 6) + 6;
  //rng for bullet spawn around the map
  let y;
  let x;

  if (Math.random() > 0.5) {
    x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
  }

  const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
  const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  bullets.push(new Bullet(x, y, radius, color, velocity));
  console.log("go");
}, 1000);

//cooldown variable
let canClick = true;

//EVENT 'click' creates a new projectile

function detectClick() {
  addEventListener("click", (event) => {
    if (canClick) {
      const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
      );
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      };
      projectiles.push(
        new Projectile(
          canvas.width / 2,
          canvas.height / 2,
          5,
          "white",
          velocity
        )
      );
      canClick = false;
      setTimeout(() => {
        canClick = true;
      }, 200);
    }
  });
}

startGame.addEventListener("click", () => {
  if (canClick) {
    init();
    detectClick();
    animate();
    startGui.style.display = "none";
    canClick = false;
    setTimeout(() => {
      canClick = true;
    }, 10);
  }
});
