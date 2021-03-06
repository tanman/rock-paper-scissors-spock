// const io = require("socket.io-client");

// export default class Socket {
//   constructor() {
//     console.log("socket instance constructed");
//     this.socket = io.connect("http://localhost:3000/");

//     this.socket.on("connect", () => {
//       console.log(this.socket.id);
//     });
//     this.socket.on("msg", (msg) => {
//       console.log(`server-${msg}`);
//     });
//   }

//   sendMessage() {
//     this.socket.emit("msg", `hey im socket ${this.socket.id}`);
//   }
// }
