let socket;
let circles = [];
let tokens = [];
let explosions = [];

let selected = null;
let blurEffect = false;

function setup() {
  createCanvas(800, 600);
  socket = io();

  socket.on("init", data => {
    circles = data.circles;
    tokens = data.tokens;
  });

  socket.on("state", data => {
    circles = data.circles;
    tokens = data.tokens;
    explosions = data.explosions;
  });

  socket.on("blur", val => {
    blurEffect = val;
  });
}

function draw() {
  background(255);

  if (blurEffect) {
    drawingContext.filter = "blur(8px)";
  } else {
    drawingContext.filter = "none";
  }

  if (selected !== null) {
    let dx = 0, dy = 0;

    if (keyIsDown(LEFT_ARROW)) dx = -5;
    if (keyIsDown(RIGHT_ARROW)) dx = 5;
    if (keyIsDown(UP_ARROW)) dy = -5;
    if (keyIsDown(DOWN_ARROW)) dy = 5;

    if (dx !== 0 || dy !== 0) {
      socket.emit("move", { id: selected, dx, dy });
    }
  }

  fill("blue");
  noStroke();
  tokens.forEach(t => {
    circle(t.x, t.y, 15);
  });

  circles.forEach(c => {
    fill(c.color);
    circle(c.x, c.y, 40);
  });

  explosions.forEach(e => {
    fill(255, 150, 0, 150);
    circle(e.x, e.y, 60);
  });
}

function mousePressed() {
  circles.forEach(c => {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < 20) {
      selected = c.id;
      socket.emit("select", c.id);
    }
  });
}

function keyPressed() {
  if (selected === null) return;

  let dx = 0, dy = 0;

  if (keyCode === LEFT_ARROW) dx = -5;
  if (keyCode === RIGHT_ARROW) dx = 5;
  if (keyCode === UP_ARROW) dy = -5;
  if (keyCode === DOWN_ARROW) dy = 5;

  socket.emit("move", { id: selected, dx, dy });
}
