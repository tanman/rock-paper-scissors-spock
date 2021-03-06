import Vue from 'vue'
import Vuex from 'vuex'
// import Socket from '../socket/socket'
// const io = require("socket.io-client");

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {

    // client metadata
    val: 10,
    inLobby: false,
    inGame: false,
    roomCode: "AXY7",

    // socket instance
    socket: null,
  },
  mutations: {
    increment (state){
      state.val++
    },

    setSocket (state, socket){
      state.socket = socket
    }
  },
  actions: {
    increment (context){
      context.commit('increment')
    },

    // initializeSocket (context) {
    //   console.log("attempting to initialize socket");
    //   let socket = io.connect("http://localhost:3000/");
    //   socket.on("connect", () => {
    //     console.log(socket.id);
    //   });
    //   socket.on("msg", (msg) => {
    //     console.log(`server-${msg}`);
    //   });

    //   context.commit('setSocket', socket)
    // }

    // to-server communication
  },
  getters: {
    getVal(state) {
      if(state.val){
        return state.val
      }
      return null
    },
    socket(state){
      return state.socket
    },
    socketId(state){
      return state.socket.id
    }
  }
})

export default store