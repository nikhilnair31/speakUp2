const socket = io('/');

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;
const username = prompt("Enter your name");

const peer = new Peer()

let myVideoStream;
navigator.mediaDevices
	.getUserMedia({ audio: true, video: false, })
	.then((stream) => {
		myVideoStream = new MediaStream();
		addVideoStream(myVideo, myVideoStream);
	});

peer.on("call", (call) => {
	call.answer();
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		liveStream = userVideoStream;
		addVideoStream(video, userVideoStream);
	});
});

peer.on("open", (userid) => {
	console.log(`Room\nROOM_ID: ${ROOM_ID} | userid: ${userid} | username: ${username}`);
	socket.emit("join-room", ROOM_ID, userid, username);
});

const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoGrid.append(video);
	});
};

let text = document.getElementById("chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
	if (text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

text.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

const muteButton = document.querySelector("#muteButton");
muteButton.addEventListener("click", () => {
	const enabled = liveStream.getAudioTracks()[0].enabled;
	if (enabled) {
		liveStream.getAudioTracks()[0].enabled = false;
		html = `<i class="fas fa-volume-mute"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	} else {
		liveStream.getAudioTracks()[0].enabled = true;
		html = `<i class="fas fa-volume-up"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	}
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
	const enabled = liveStream.getVideoTracks()[0].enabled;
	if (enabled) {
		liveStream.getVideoTracks()[0].enabled = false;
		html = `<i class="fas fa-video-slash"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	} else {
		liveStream.getVideoTracks()[0].enabled = true;
		html = `<i class="fas fa-video"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	}
});

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
	prompt(
		"Copy this link and send it to people to view this stream",
		window.location.href
	);
});

const endCallButton = document.querySelector("#endCallButton");
endCallButton.addEventListener("click", (e) => {
	console.log(`endCallButton click`);
	socket.emit("exit-room", ROOM_ID, username);
});

socket.on("user-exited-room", (userId)=>{
	peer.disconnect();
    window.location.pathname = '/home';
});
socket.on("createMessage", (message, userName) => {
	messages.innerHTML =
		messages.innerHTML +
		`<div class="message">
        	<b>
				<i class="far fa-user-circle"></i> 
				<span> ${userName === username ? "me" : userName}</span> 
			</b>
        <span class="msg_txt">${message}</span>
    </div>`;
});
