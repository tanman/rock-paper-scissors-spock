<template>
  <v-app>
    <app-bar />
    <v-main class="blue">
      <v-container>
        <v-card class="text-center mx-auto mt-4" dark max-width="750">
          <v-card-text>
            <v-row align="center">
              <v-col>
                <h2 class="white--text">
                  Send the code below to a friend (on your network) to have them
                  join your game!
                </h2>
                <!-- <p>{{ this.val }}</p> -->
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
                    max-width="20px"
                    v-model="toRoom"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card dark max-width="750px" class="mx-auto d-flex justify-center">
          <v-btn dark @click="sendMessage()"
            >Socket id:{{ this.socketId }}</v-btn
          >
          <v-btn dark @click="sendRock()">Rock</v-btn>
          <v-btn dark @click="sendPaper()">Paper</v-btn>
          <v-btn dark @click="sendScissors()">Scissors</v-btn>
          <v-btn dark @click="sendLizard()">Lizard</v-btn>
          <v-btn dark @click="sendSpock()">Spock</v-btn>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "./components/AppBar";
// import { mapActions, mapGetters } from "vuex";
// import LobbyCard from "./components/LobbyCard.vue";
const io = require("socket.io-client");

export default {
  name: "App",

  components: {
    AppBar,
    // LobbyCard,
  },

  methods: {
    // ...mapActions(["initializeSocket"]),

    sendMessage() {
      // console.log(`hello from vue`)
      // this.$store.state.socket.sendMessage()
      this.socket.emit("msg", `hey im socket ${this.socket.id}`);
    },
    sendRock() {
      this.socket.emit("userMove", "rock");
    },
    sendPaper() {
      this.socket.emit("userMove", "paper");
    },
    sendScissors() {
      this.socket.emit("userMove", "scissors");
    },
    sendLizard() {
      this.socket.emit("userMove", "lizard");
    },
    sendSpock() {
      this.socket.emit("userMove", "spock");
    },
  },

  computed: {
    // ...mapGetters(["socket, socketId"]),
    // roomCode: function() {
    //   return this.$store.state.roomCode;
    // },
    // socket: function() {
    //   return this.$store.state.socket
    // },
    // socketId: function() {
    //   return this.$store.state.socket.id
    // }
  },

  data: () => ({
    socketId: null,
    socket: null,
    roomCode: "AXY7",
    toRoom: ""
  }),

  mounted: function() {
    // this.$store.dispatch('initializeSocket')
    // this.initializeSocket()
    console.log("attempting to initialize socket");

    // locally initialize socket
    if (!this.socket) {
      let socket = io.connect("http://localhost:3000/");
      socket.on("connect", () => {
        // console.log(this.socket.id);
        this.socketId = socket.id;
      });
      socket.on("msg", (msg) => {
        console.log(`server-${msg}`);
      });
      this.socket = socket;
    }
  },
};
</script>
