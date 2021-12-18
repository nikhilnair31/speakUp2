const socket = io('/');

let roomgrid = document.getElementById("video-grid");

socket.emit("home-new-user");

socket.on("sent-active-rooms", (list) => {
    if(list === null) {
        roomgrid.innerHTML = `<img src="./public/favicon.png"/>`;
    }
    else{
        roomgrid.innerHTML = ``;
        for (const roomid of list) {
            roomgrid.innerHTML += `<a id="room-id" href="/joinroom/${roomid}" action="/joinroom/${roomid}" method = "post"> ${roomid} </a>`;
        }
    }
});

let goLiveButton = document.getElementById("goLiveButton");
goLiveButton.addEventListener("click", (e) => {
    window.location.pathname = '/liveroom';
});