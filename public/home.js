// const socket = io('/');

// const peer = new Peer()
// const app = express();
// var server = require('../server.js');

// peer.on("open", (id) => {
// 	socket.emit("join-room", ROOM_ID, id, user);
// });

let goLiveButton = document.getElementById("goLiveButton");
goLiveButton.addEventListener("click", (e) => {
    // 'https://192.168.1.15:4050/liveroom'
    // 'http://localhost:3050/liveroom'
    window.location = 'https://192.168.1.15:4050/liveroom';
});

let joinRoomButton = document.getElementById("joinRoomButton");
joinRoomButton.addEventListener("click", (e) => {
    window.location = 'http://localhost:3050/joinroom';
});