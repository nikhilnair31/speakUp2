let goLiveButton = document.getElementById("goLiveButton");
goLiveButton.addEventListener("click", (e) => {
    window.location.pathname = '/liveroom';
});

let joinRoomButton = document.getElementById("joinRoomButton");
joinRoomButton.addEventListener("click", (e) => {
    window.location.pathname = '/joinroom';
});