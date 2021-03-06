console.log("server.js running");

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
server.listen(3000, () => console.log("listening on :3000"));

let users = [];
io.on("connection", (socket) => {
  console.log(`connection successful: socket id:${socket.id}`);

  socket.on("serverJoin", (username) => {
    const user = {
      username,
      id: socket.id,
      room: "",
    };
    users.push(user);
    io.emit("newUser", users);
  });

  socket.on("roomJoin", (roomName) => {

    let success = false;
    if (roomOccupancy(roomName) < 2) {
      socket.join(roomName);
      getUserBySocketId(socket.id).room = roomName;
      success = true;
    }

    socket.emit("roomJoinResult", success);
  });

  socket.on("msg", (msg) => {
    console.log(`received ${msg}`);
    socket.broadcast.emit("msg", msg);
    // can also specify the socket id we want to talk to
    // io.to(socket#id).emit('hey')
  });

  socket.on("userMove", (type) => {
    console.log(`received ${type}`);
    socket.emit("msg", type);
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => {
      user.id !== socket.id;
    });
    io.emit("newUser", users);
  });
});

// helpers
function roomOccupancy(room) {
  let count = 0;
  users.forEach((user) => {
    if (user.room === room) count++;
  });
  return count;
}

function getUserBySocketId(id) {
  let user = users.filter((user) => {
    user.id === id;
  });
  return user;
}
