const socket = io('/');

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const username = prompt("Enter your name");
const peer = new Peer()

let localStream;
navigator.mediaDevices
	.getUserMedia({ audio: true, video: true, })
	.then((stream) => {
		console.log(`getUserMedia`);
		localStream = stream;
		addVideoStream(myVideo, stream);
	});

peer.on("call", (call) => {
	console.log(`peer on call answer`);
	call.answer(localStream);
	
	const video = document.createElement("video");
	video.muted = true;

	// the remote stream here can either be null if answering to a call from a viewer or real if answering from another streamer
	call.on("stream", (remoteStream) => {
		console.log(`call on stream`);
		addVideoStream(video, remoteStream);
	});
});

// socket to check for either a viewer or a streamer connecting
socket.on("streamer-connected", (newStreamerID) => {
	connectToNewStreamer(newStreamerID, localStream);
});
const connectToNewStreamer = (newStreamerID, stream) => {
	console.log(`connectToNewStreamer`);
	const call = peer.call(newStreamerID, stream);

	const video = document.createElement("video");
	video.muted = true;

	call.on("stream", (newRemoteStream) => {
		console.log(`call.on('stream')`);
		addVideoStream(video, newRemoteStream);
	});
	call.on('close', () => {
		console.log(`call.on('close')`);
        video.remove()
    })
};

socket.on("viewer-connected", (newViewerID) => {
	connectToNewViewer(newViewerID, localStream);
});
const connectToNewViewer = (newViewerID, stream) => {
	console.log(`connectToNewViewer`);
	// Outgoing call that passes streamers local stream to the viewer userid
	const call = peer.call(newViewerID, stream);
	
	call.on("stream", (viewerStream) => {
		console.log(`call.on('stream')`);
		// addVideoStream(video, viewerStream);
	});
	call.on('close', () => {
		console.log(`call.on('close')`);
        video.remove()
    })
};

peer.on("open", (userid) => {
	console.log(`peer on open room \nROOM_ID: ${ROOM_ID} \nuserid: ${userid} \nusername: ${username}`);
	socket.emit("join-room-as-streamer", ROOM_ID, userid, username);
});

const addVideoStream = (video, stream) => {
	console.log(`addVideoStream`);
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		console.log(`loadedmetadata`);
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
	const enabled = localStream.getAudioTracks()[0].enabled;
	if (enabled) {
		localStream.getAudioTracks()[0].enabled = false;
		html = `<i class="fas fa-microphone-slash"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	} else {
		localStream.getAudioTracks()[0].enabled = true;
		html = `<i class="fas fa-microphone"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	}
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
	const enabled = localStream.getVideoTracks()[0].enabled;
	if (enabled) {
		localStream.getVideoTracks()[0].enabled = false;
		html = `<i class="fas fa-video-slash"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	} else {
		localStream.getVideoTracks()[0].enabled = true;
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
	peer.disconnect();
	socket.emit("disconnect");
	window.location.pathname = '/home';
});

socket.on("streamer-exited-room", (userId)=>{
	console.log("streamer-exited-room : ", userId);
});
socket.on("createMessage", (message, userName) => {
	console.log("createMessage");
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
