const socket = io('/');

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

const username = prompt("Enter your name");

const peer = new Peer()
// var peer = new Peer(undefined, {
// 	path: "/peerjs",
// 	host: "/",
// 	port: "3050",
// });

let myVideoStream;
navigator.mediaDevices
	.getUserMedia({ audio: true, video: true, })
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);

		peer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});

		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
	});

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
        video.remove()
    })
};

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
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		html = `<i class="fas fa-microphone-slash"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	} else {
		myVideoStream.getAudioTracks()[0].enabled = true;
		html = `<i class="fas fa-microphone"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	}
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
	const enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		html = `<i class="fas fa-video-slash"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	} else {
		myVideoStream.getVideoTracks()[0].enabled = true;
		html = `<i class="fas fa-video"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	}
});

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
	prompt(
		"Copy this link and send it to people you want to meet with",
		window.location.href
	);
});

const endCallButton = document.querySelector("#endCallButton");
endCallButton.addEventListener("click", (e) => {
	peer.disconnect();
	socket.emit("disconnect");
    // window.location = 'https://192.168.1.15:4050/home';
	window.location.pathname = '/home';
});

socket.on("createMessage", (message, userName) => {
	messages.innerHTML =
		messages.innerHTML +
		`<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === username ? "me" : userName
		}</span> </b>
        <span>${message}</span>
    </div>`;
});
