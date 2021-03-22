<template>
  <v-app>
    <app-bar />
    <v-main>
      <v-container>
        <v-card v-if="!userNameSet" dark class="white--text">
          <v-card-title>Set your username!</v-card-title>

          <v-card-actions>
            <v-text-field
              max-width="20px"
              v-model="userNameInput"
              v-on:keyup.enter="setUsername()"
            ></v-text-field>
            <v-checkbox v-model="saveUsername" :label="'save username?'"></v-checkbox>
          </v-card-actions>
        </v-card>

        <div v-if="!roomOccupied">
          <v-card class="text-center mx-auto mt-4" dark>
            <v-card-text>
              <v-row align="center">
                <v-col>
                  <h2 class="white--text">
                    Send the code below to a friend (on your network) to have
                    them join your game!
                  </h2>
                  <v-card
                    flat
                    color=""
                    class="rounded-lg mx-auto d-flex justify-center"
                  >
                    <v-card-title class="headline">{{ roomCode }}</v-card-title>
                  </v-card>
                  <h2 class="white--text">
                    Or enter a code to join someone else's game
                  </h2>
                  <div class="d-flex align-center">
                    <v-text-field
                      class="centered mt-n4 mb-n4"
                      v-model="toRoom"
                      v-on:keyup.enter="joinRequest()"
                      :disabled="disableRoomChange"
                    ></v-text-field>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <div v-if="roomOccupied">
          <v-card dark v-if="currentRoom" class="mx-auto d-flex justify-center">
            <v-card-title>Name: {{ user.username }}</v-card-title>
            <v-card-title>{{ user.room }}</v-card-title>
          </v-card>

          <v-card dark v-if="currentRoom" class="mx-auto d-flex justify-center">
            <v-card-title>You: {{ user.wins }} Opponent: {{ user.losses }}</v-card-title>
          </v-card>

          <v-card dark v-if="currentRoom">
            <v-row no-gutters class="d-flex justify-center">
              <v-col cols="12">
                <v-btn small text outlined dark @click="sendRock()">Rock</v-btn>
                <v-btn small text outlined dark @click="sendPaper()">Paper</v-btn>
                <v-btn small text outlined dark @click="sendScissors()">Scissors</v-btn>
                <v-btn small text outlined dark @click="sendLizard()">Lizard</v-btn>
                <v-btn small text outlined dark @click="sendSpock()">Spock</v-btn>
              </v-col>
              <v-col cols="12" class="d-flex justify-center">
                <v-btn small text outlined dark @click="sendSpeech()">Say Move</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <div v-if="messages">
          <v-card dark class="white--text mt-4" v-for="(message, index) in messages" :key="index">
            <v-card-title>{{message}}</v-card-title>
          </v-card>
        </div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "./components/AppBar";
const io = require("socket.io-client");

var recognition = new window.webkitSpeechRecognition();
recognition.onspeechend = function () {
  console.log("speech end")
  recognition.stop();
};

export default {
  name: "App",

  components: {
    AppBar,
  },

  methods: {

    randomRoom(length) {
      let result = "";
      let characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      this.roomCode = result;
    },
    sendMessage() {
      this.socket.emit("msg", `hey im socket ${this.socket.id}`);
    },
    sendRock() {
      this.socket.emit("userMove", 0);
    },
    sendPaper() {
      this.socket.emit("userMove", 1);
    },
    sendScissors() {
      this.socket.emit("userMove", 2);
    },
    sendLizard() {
      this.socket.emit("userMove", 3);
    },
    sendSpock() {
      this.socket.emit("userMove", 4);
    },
    sendSpeech() {
      recognition.start();
    },
    getCode(word) {
      switch(word) {
        case "rock":
          return 0;
        case "paper":
          return 1;
        case "scissors":
          return 2;
        case "lizard":
          return 3;
        case "spock":
          return 4;
      }
    },
    joinRequest() {
      this.socket.emit("roomJoin", this.toRoom);
      this.toRoom = "";
    },
    joinInitialRoom() {
      this.socket.emit("roomJoin", this.roomCode);
    },
    setUsername() {
      if (this.saveUsername) window.localStorage.setItem("savedUsername", this.userNameInput)

      this.userName = this.userNameInput;
      this.userNameSet = true;
      this.userNameInput = "";
      this.socket.emit("serverJoin", this.userName);
      this.joinInitialRoom();
      this.disableRoomChange = false;
    },
  },

  computed: {

    roomOccupied: function() {
      let room = this.user.room;
      let count = 0;
      this.users.forEach((user) => {
        if (user.room === room) count++;
      });
      return count === 2;
    },
  },

  data: () => ({
    socketId: null,
    socket: null,
    roomCode: "",
    toRoom: "",
    currentRoom: "",
    users: [],
    user: {},
    userNameSet: false,
    userNameInput: "",
    userName: "",
    registered: false,
    disableRoomChange: true,
    messages: [],
    saveUsername: false,
    recognition: null
  }),

  mounted: function() {

    recognition.onresult = (event) =>{
    console.log("on result")
    let transcript = event.results[0][0].transcript;
    console.log(transcript)
    if (confirm(`Are you sure you want to send '${transcript}-${this.getCode(transcript)}'?`)){
      this.socket.emit("userMove", this.getCode(transcript));
    }
    };

    this.randomRoom(4);
    let savedUserCheck = window.localStorage.getItem("savedUsername")
    if (savedUserCheck) this.userNameInput = savedUserCheck

    // locally initialize socket
    if (!this.socket) {
      let socket = io.connect("http://localhost:3000/");
      socket.on("connect", () => {
        this.socketId = socket.id;
      });

      socket.on("roomJoinResult", ({ status, room }) => {
        // console.log(`client received success-${status} room-${room}`);
        if (status === true) {
          this.currentRoom = room;
          // console.log("room join successful");
        } else {
          // console.log("room join unsuccessful");
        }
      });

      socket.on("usersUpdate", (users) => {
        this.users = users;
        // console.log(`updated users\n${JSON.stringify(users, null, 2)}`);
      });

      socket.on("userUpdate", (user) => {
        this.user = user;
        // console.log(`updated THE user\n${JSON.stringify(user, null, 2)}`);
      });

      socket.on("results", (payload) => {
        // console.log(`Received results!\n${JSON.stringify(payload, null, 2)}`);
        this.messages.push(payload.message)

        // speak!
        const speaker = window.speechSynthesis
        let phrase = new SpeechSynthesisUtterance(payload.message)
        speaker.speak(phrase)
      });
      this.socket = socket;
    }
  },
};
</script>

<style>
  .v-btn__content {
    font-size: 10px !important;
    padding: 0px !important;
  }
</style>
