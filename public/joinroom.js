const socket = io('/');

let text = document.getElementById("chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");
const videoGrid = document.getElementById("video-grid");

const username = prompt("Enter your name");
const peer = new Peer();

const createEmptyAudioTrack = () => {
	const ctx = new AudioContext();
	const oscillator = ctx.createOscillator();
	const dst = oscillator.connect(ctx.createMediaStreamDestination());
	oscillator.start();
	const track = dst.stream.getAudioTracks()[0];
	return Object.assign(track, { enabled: false });
};
const createEmptyVideoTrack = ({ width, height }) => {
	const canvas = Object.assign(document.createElement('canvas'), { width, height });
	canvas.getContext('2d').fillRect(0, 0, width, height);

	const stream = canvas.captureStream();
	const track = stream.getVideoTracks()[0];

	return Object.assign(track, { enabled: false });
};
const audioTrack = createEmptyAudioTrack();
const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
const localNullStream = new MediaStream([audioTrack, videoTrack]);

// listening for "streamer-connected" socket emit from server to call the new streamer
socket.on("streamer-connected", (newStreamerID) => {
	console.log(`connectToNewStreamer`);
	const call = peer.call(newStreamerID, localNullStream);

	const video = document.createElement("video");
	video.muted = false;

	call.on("stream", (remoteStream) => {
		console.log(`streamer-connected stream`);
		addVideoStream(video, remoteStream);
	});
	call.on('close', () => {
		console.log(`streamer-connected close`);
        video.remove()
    })
});

// listening for peerjs call from streamer to be answered
peer.on("call", (call) => {
	console.log(`peer call answer`);
	call.answer(localNullStream);

	const video = document.createElement("video");
	video.muted = true;

	call.on("stream", (remoteStream) => {
		console.log(`peer call stream`);
		addVideoStream(video, remoteStream);
	});
});
// runs right after page loads
peer.on("open", (userid) => {
	console.log(`JOIN peer open \nROOM_ID: ${ROOM_ID} | userid: ${userid} | username: ${username}`);
	socket.emit("join-room-as-viewer", ROOM_ID, userid, username);
});

const addVideoStream = (video, stream) => {
	// console.log(`addVideoStream`);
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		// console.log(`loadedmetadata`);
		video.play();
		videoGrid.append(video);
	});
}

text.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});
send.addEventListener("click", (e) => {
	if (text.value.length !== 0) {
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
