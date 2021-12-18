// const https = require(`https`);
// const fs = require('fs');
// const {MongoClient} = require('mongodb');
// const servers = https.Server(options, app);
// const options = {
// 	key: fs.readFileSync('./Keys/key.pem'),
// 	cert: fs.readFileSync('./Keys/cert.pem')
// };

// const { ExpressPeerServer } = require("peer");
// const io = require("socket.io")(server, {
// 	cors: {
// 		origin: '*'
// 	}
// });
// const peerServer = ExpressPeerServer(server, {
//   	debug: true,
// 	port: 443
// });
// app.use("/peerjs", peerServer);
// var peerServer = ExpressPeerServer(server, options);
// app.use('/peer', peerServer);
// peerServer.on('connection', function (id) {
//     console.log('user with ', id, 'connected');
// });

// async function listDatabases(client){
//     databasesList = await client.db().admin().listDatabases();
//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };

// async function main(){
// 	const uri = "mongodb+srv://niknair31:idhome37@cluster0.0ls2m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//     const client = new MongoClient(uri);
//     try {
//         await client.connect();
//         await  listDatabases(client);
//     } 
// 	catch (e) {
//         console.error(e);
//     } 
// 	finally {
//         await client.close();
//     }
// }
// main().catch(console.error);

// servers.listen(port);

const http = require(`http`);
const express = require("express");
const admin = require('firebase-admin')

const port = process.env.PORT || 3050

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server)

var serviceAccount = require("./speakup-31-firebase-adminsdk-8sdqr-62149a46b1.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://speakup-31-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const database = admin.database();

app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use('/', require('./server/routes/router'));

io.on("connection", (socket) => {
	console.log('\nconnection');
	socket.on("join-room", (roomId, userId, userName) => {
		console.log('join-room user: ', userId, ' connected to: ', roomId);
		
		// Add roomId as child to Rooms
		var roomidRef = database.ref('Rooms').child(String(roomId));
		roomidRef.once('value', function(snapshot) {
			if (snapshot.val()) {
				console.log("Room exists - ", snapshot.val());
				var roomCurrViewerCount = snapshot.val().viewer_count;
				var roomNewViewerCount = ++roomCurrViewerCount;
				roomidRef.update({viewer_count: roomNewViewerCount});
			} 
			else {
				console.log("Rooom does not exist - ", snapshot.val());
				database.ref('Rooms').child(String(roomId)).set({
					viewer_count: 0
				});
			}
		});

		socket.join(roomId);
		socket.to(roomId).broadcast.emit("user-connected", userId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);

			database.ref('Rooms').child(String(roomId)).child('Messages').push({
				username: userName,
				message: message
			});
		});
	});
	socket.on('disconnect', (roomId, userId, userName) => {
		socket.emit('user-disconnected', userId);
		
		// Figure out way to get room_id and then reduce viewer count in firebase (maybe keep track of viewer id with socket only?)
		// var roomidRef = database.ref('Rooms').child(String(roomId));
		// roomidRef.once('value', function(snapshot) {
		// 	console.log('disconnected - ', snapshot.val());
		// 	var roomCurrViewerCount = snapshot.val().viewer_count;
		// 	var roomNewViewerCount = --roomCurrViewerCount;
		// 	roomidRef.update({viewer_count: roomNewViewerCount});
		// });
	});
});

server.listen(port);