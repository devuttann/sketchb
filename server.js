const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// ✅ VERY IMPORTANT: serve public folder
app.use(express.static(__dirname + "/public"));

let drawings = [];

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("init", drawings);

  socket.on("draw", (data) => {
    drawings.push(data);
    socket.broadcast.emit("draw", data);
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});