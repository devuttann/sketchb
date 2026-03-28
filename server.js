const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

// --- GAME STATE ---
let circles = [
  { id: 0, x: 200, y: 200, owner: null, color: "black", powered: false },
  { id: 1, x: 400, y: 200, owner: null, color: "black", powered: false },
  { id: 2, x: 600, y: 200, owner: null, color: "black", powered: false }
];

let tokens = [];
let explosions = [];

// --- TOKEN SPAWN LOOP ---
setInterval(() => {
  tokens.push({
    id: Date.now(),
    x: Math.random() * 800,
    y: Math.random() * 600
  });
}, 4000);

// --- SOCKET ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("init", { circles, tokens });

  // --- SELECT CIRCLE ---
  socket.on("select", (id) => {
    let c = circles.find(c => c.id === id);
    if (c && c.owner === null) {
      c.owner = socket.id;
    }
  });

  // --- MOVE ---
  socket.on("move", ({ id, dx, dy }) => {
    let c = circles.find(c => c.id === id);

    if (c && c.owner === socket.id) {
      c.x += dx;
      c.y += dy;

      // --- COLLISION WITH TOKEN ---
      tokens.forEach((t, i) => {
        let d = Math.hypot(c.x - t.x, c.y - t.y);

        if (d < 30) {
          // remove token
          tokens.splice(i, 1);

          // explosion
          explosions.push({ x: t.x, y: t.y, time: Date.now() });

          // power mode
          c.color = "red";
          c.powered = true;

          socket.emit("blur", true); // only this player

          setTimeout(() => {
            c.color = "black";
            c.powered = false;
            socket.emit("blur", false);
          }, 5000);
        }
      });
    }
  });

  // --- DISCONNECT ---
  socket.on("disconnect", () => {
    circles.forEach(c => {
      if (c.owner === socket.id) c.owner = null;
    });
  });
});

// --- SYNC LOOP ---
setInterval(() => {
  io.emit("state", { circles, tokens, explosions });
}, 50);

http.listen(3000, () => {
  console.log("Running...");
});
