const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const app = express();
httpServer = http.createServer(app);
const io = new Server(httpServer);
const PORT = 4000;

app.use(express.static('public'));
io.on('connect', (socket) => {
    let userName;
    socket.on('username',(username) => {
        userName = username;
        console.log(userName+' connected!');
    })
    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage',{userName, msg});
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    })
})

httpServer.listen(PORT, () => {
    console.log(`server started running on http://localhost:${PORT}`);
})

