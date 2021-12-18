const socket = io('/');

let text = document.getElementById("chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const username = prompt("Enter your name");
const peer = new Peer()

let localStream;
navigator.mediaDevices.getUserMedia({ audio: true, video: true, })
	.then((stream) => {
		// console.log(`getUserMedia`);
		localStream = stream;
		addVideoStream(myVideo, stream);
	});

// listening for "streamer-connected" socket emit from server to call the new new streamer
socket.on("streamer-connected", (newStreamerID) => {
	console.log(`connectToNewStreamer`);
	const call = peer.call(newStreamerID, localStream);

	const video = document.createElement("video");
	video.muted = true;

	call.on("stream", (newRemoteStream) => {
		console.log(`streamer-connected call on stream`);
		addVideoStream(video, newRemoteStream);
	});
	call.on('close', () => {
		console.log(`streamer-connected call on close`);
        video.remove()
    })
});
// listening for "viewer-connected" socket emit from server to call the new new viewer
socket.on("viewer-connected", (newViewerID) => {
	console.log(`connectToNewViewer`);
	// Outgoing call that passes streamers local stream to the viewer userid
	const call = peer.call(newViewerID, localStream);
	
	call.on("stream", () => {
		console.log(`viewer-connected call stream`);
	});
	call.on('close', () => {
		console.log(`viewer-connected call close`);
        video.remove();
    })
});

// listening for peerjs call from streamer to be answered when this script is that of a new streamer
peer.on("call", (call) => {
	console.log(`peer on call answer`);
	call.answer(localStream);
	
	const video = document.createElement("video");
	video.muted = true;

	// the remote stream here can either be null if answering to a call from a viewer or real if answering from another streamer
	call.on("stream", (remoteStream) => {
		console.log(`peer call on stream`);
		addVideoStream(video, remoteStream);
	});
});
// runs right after page loads
peer.on("open", (userid) => {
	console.log(`peer on open room \nROOM_ID: ${ROOM_ID} \nuserid: ${userid} \nusername: ${username}`);
	socket.emit("join-room-as-streamer", ROOM_ID, userid, username);
});

const addVideoStream = (video, stream) => {
	// console.log(`addVideoStream`);
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		// console.log(`loadedmetadata`);
		video.play();
		videoGrid.append(video);
	});
};

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
	var currlink = window.location.href;
	var newlink = currlink.replace('liveroom', 'joinroom')
	prompt(
		"Copy this link and send it to people to view this stream",
		newlink
	);
});

const logoButton = document.querySelector(".logo");
const endCallButton = document.querySelector("#endCallButton");
logoButton.addEventListener("click", (e) => {
	console.log(`logoButton click`);
	socket.emit("exit-room", ROOM_ID, username);
});
endCallButton.addEventListener("click", (e) => {
	console.log(`endCallButton click`);
	socket.emit("exit-room", ROOM_ID, username);
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
