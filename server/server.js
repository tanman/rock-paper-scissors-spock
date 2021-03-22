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
      username: username,
      id: socket.id,
      move: null,
      room: "",
      wins: 0,
      losses: 0,
      ties: 0,
    };
    users.push(user);
    io.emit("usersUpdate", users);
    socket.emit("userUpdate", getUserBySocketId(socket.id))
  });

  socket.on("roomJoin", (roomName) => {
    let success = false;
    // console.log(`join request for ${roomName}\n occupancy:${roomOccupancy(roomName)}`)
    if (roomOccupancy(roomName) < 2) {
      socket.join(roomName);
      success = true;
      setUserRoom(socket.id, roomName);
      io.emit("usersUpdate", users);
      socket.emit("userUpdate", getUserBySocketId(socket.id))
    }
    socket.emit("roomJoinResult", { status: success, room: roomName });
  });

  socket.on("msg", (msg) => {
    console.log(`received ${msg}`);
    socket.broadcast.emit("msg", msg);
    // can also specify the socket id we want to talk to
    // io.to(socket#id).emit('hey')
  });

  socket.on("userMove", (move) => {
    console.log(`received ${move}`);
    socket.emit("msg", move);
    let senderId = socket.id;
    setMove(socket.id, move);
    io.emit("usersUpdate", users);
    socket.emit("userUpdate", getUserBySocketId(socket.id))
    let room = getUserBySocketId(senderId).room;
    console.log(`userMove, read senders room as ${room}`)
    console.log(`move from socket\n${JSON.stringify(getUserBySocketId(socket.id), null, 2)}`)

    // if both users have answered,
    if (haveBothUsersAnswered(room)) {
      console.log("detected both users have answered")
      let opponents = getUsersByRoom(room);
      let userA = opponents[0];
      let userB = opponents[1];
      console.log(`opponents\n${JSON.stringify(opponents, null, 2)}`)

      // determine winner
      let payload = results[userA.move][userB.move];
      // user A wins
      if (payload.winner === 0) {
        payload.winner = userA.id;
        incrementProperty(userA.id, "wins");
        incrementProperty(userB.id, "losses");
        // user B wins
      } else if (payload.winner === 1) {
        payload.winner = userB.id;
        incrementProperty(userB.id, "wins");
        incrementProperty(userA.id, "losses");
      }
      // tie
      else {
        incrementProperty(userA.id, "ties");
        incrementProperty(userB.id, "ties");
      }

      // and send back the results
      console.log(`results- ${JSON.stringify(payload, null, 2)}`)
      io.emit("usersUpdate", users);
      io.to(userA.id).emit("userUpdate", getUserBySocketId(userA.id))
      io.to(userB.id).emit("userUpdate", getUserBySocketId(userB.id))
      io.to(room).emit("results", payload);

      // set user moves back to null
      setMove(userA.id, null)
      setMove(userB.id, null)
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => {
      user.id !== socket.id;
    });
    io.emit("usersUpdate", users);
    socket.emit("userUpdate", getUserBySocketId(socket.id))
  });
});

// helpers /////////////////////////////////////////////////
function roomOccupancy(room) {
  let count = 0;
  users.forEach((user) => {
    if (user.room === room) count++;
  });
  return count;
}

function getUserBySocketId(id) {
  // console.log(`query request for user with socket id ${JSON.stringify(id, null, 2)}`)
  // console.log(`current users ${JSON.stringify(users, null, 2)}`)
  let user = users.filter((user) => {
    return user.id === id;
  });
  // console.log(`returned ${JSON.stringify(user[0], null, 2)}`)
  return user[0];
}

function getUsersByRoom(room) {
  // console.log(`looking for users in room '${room}'`)
  let usersByRoom = []
  users.forEach((user)=>{
    if(user.room === room) usersByRoom.push(user)
  })
  // console.log(`BY ROOM:\n${JSON.stringify(usersByRoom, null, 2)}`)
  return usersByRoom;
}

function setUserRoom(id, room) {
  users.forEach((user) => {
    if (user.id === id) {
      user.room = room;
    }
  });
}

function setMove(id, move) {
  // console.log(`attempting to set the move ${move} to ${id}`);
  users.forEach((user) => {
    if (user.id === id) {
      // console.log("matched user, attempting to change");
      user.move = move;
    }
  });
  // console.log(JSON.stringify(users, null, 2));
}

function incrementProperty(id, prop) {
  users.forEach((user) => {
    if (user.id === id) {
      user[prop]++;
    }
  });
}

function haveBothUsersAnswered(room) {
  let answers = 0;
  console.log(`getUsersByRoom:\n${JSON.stringify(getUsersByRoom(room))}`)
  getUsersByRoom(room).forEach((user) => {
    if (user.move !== null) answers++;
  });
  return answers === 2;
}

// constants ///////////////////////////////////////////////
const rockAndScissors = "Rock crushes Scissors!";
const rockAndLizard = "Rock crushes Lizard!";
const paperAndRock = "Paper covers Rock!";
const paperAndSpock = "Paper disproves Spock!";
const scissorsAndPaper = "Scissors cuts Paper!";
const scissorsAndLizard = "Scissors decapitates lizard!";
const lizardAndPaper = "Lizard eats Paper!";
const lizardAndSpock = "Lizard poisons Spock!";
const spockAndScissors = "Spock smashes Scissors";
const spockAndRock = "Spock vaporizes Rock!";
const tie = "It's a tie!";

const results = [
  // player A: rock
  [
    {
      winner: null,
      message: tie,
    },
    {
      winner: 1,
      message: paperAndRock,
    },
    {
      winner: 0,
      message: rockAndScissors,
    },
    {
      winner: 0,
      message: rockAndLizard,
    },
    {
      winner: 1,
      message: spockAndRock,
    },
  ],

  // player A: paper
  [
    {
      winner: 0,
      message: paperAndRock,
    },
    {
      winner: null,
      message: tie,
    },
    {
      winner: 1,
      message: scissorsAndPaper,
    },
    {
      winner: 1,
      message: lizardAndPaper,
    },
    {
      winner: 0,
      message: paperAndSpock,
    },
  ],

  // player A: scissors
  [
    {
      winner: 1,
      message: rockAndScissors,
    },
    {
      winner: 0,
      message: scissorsAndPaper,
    },
    {
      winner: null,
      message: tie,
    },
    {
      winner: 0,
      message: scissorsAndLizard,
    },
    {
      winner: 1,
      message: spockAndScissors,
    },
  ],

  // player A: lizard
  [
    {
      winner: 1,
      message: rockAndLizard,
    },
    {
      winner: 0,
      message: lizardAndPaper,
    },
    {
      winner: 1,
      message: scissorsAndLizard,
    },
    {
      winner: null,
      message: tie,
    },
    {
      winner: 0,
      message: lizardAndSpock,
    },
  ],

  // player A: spock
  [
    {
      winner: 0,
      message: spockAndRock,
    },
    {
      winner: 1,
      message: paperAndSpock,
    },
    {
      winner: 0,
      message: spockAndScissors,
    },
    {
      winner: 1,
      message: lizardAndSpock,
    },
    {
      winner: null,
      message: tie,
    },
  ],
];
