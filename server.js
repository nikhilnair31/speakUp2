const fs = require('fs');
const http = require(`http`);
// const https = require(`https`);
const express = require("express");
// const {MongoClient} = require('mongodb');
const port = process.env.PORT || 3050
const options = {
	key: fs.readFileSync('./Keys/key.pem'),
	cert: fs.readFileSync('./Keys/cert.pem')
};
const app = express();
const server = http.Server(app);
const servers = https.Server(options, app);
const io = require('socket.io')(servers)

var totalOnlineCount = 0;

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

app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use('/', require('./server/routes/router'));

io.on("connection", (socket) => {
	console.log('connection');
	socket.on("join-room", (roomId, userId, userName) => {
		console.log('join-room user: ', userId, ' connected');

		socket.join(roomId);
		socket.to(roomId).broadcast.emit("user-connected", userId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
	socket.on('disconnect', function () {
		console.log('disconnected');
		socket.emit('disconnected');
	});
});

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

server.listen(port);
// servers.listen(port);