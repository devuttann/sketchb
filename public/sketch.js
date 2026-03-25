let socket;
let drawings = [];

function setup() {
  createCanvas(800, 600);
  background(255);

  socket = io();

  // Receive full drawing
  socket.on("init", (data) => {
    drawings = data;
  });

  // Receive new drawing from others
  socket.on("draw", (data) => {
    drawings.push(data);
  });
}

function draw() {
  background(255);

  // Draw all lines
  for (let d of drawings) {
    line(d.x1, d.y1, d.x2, d.y2);
  }
}

function mouseDragged() {
  let data = {
    x1: mouseX,
    y1: mouseY,
    x2: pmouseX,
    y2: pmouseY
  };

  drawings.push(data);     // draw locally
  socket.emit("draw", data); // send to server
}