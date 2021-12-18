# speakUP V2

![IMG](./public/favicon.png)

speakUP is a live video debate app that makes it easy to debate people with a massive captive audience.
Check out the live demo: https://speakup2.herokuapp.com/home

This app is build using NodeJS, Socket.io, and Peerjs(WebRTC)

## How to run?

1. Clone repo locally.
2. Run `npm start`.
3. Open `http://127.0.0.1:5000/`.

## How to use?
1. Open `https://speakup2.herokuapp.com/home` to go to Home page.
2. Start live stream or join a room.

### ToDo
- [ ] - Track count of viewrs in a room
- [ ] - Get some DB involved that keeps track of current live rooms
- [ ] - Get data from DB of current live rooms and display the room ID on home page
- [ ] - Make those room IDs joinable by clicking
- [ ] - If a speaker in a room disconnects then remove his stream from all viewers and the remaining speakers
- [ ] - Put a limit to max room speakers
- [ ] - Use DB to save chat history as long as room is active