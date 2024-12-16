const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const app = express();
httpServer = http.createServer(app);
const io = new Server(httpServer);
const PORT = 4000;
app.use(express.static('public'));
app.use('/src', express.static('src'));
const users = {};
let usernames = [];
io.on('connect', (socket) => {
    let userName;
    socket.on('username',(username) => {
        userName = username;
        console.log(userName+' connected!');
        users[username] = socket.id;
        usernames.push(username);
        io.emit('userJoined', userName+' joined the chat.');
        io.emit('activeUsers', usernames);
    })
    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage',{userName, msg});
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
        usernames = usernames.filter((userleft) => userleft !== userName);
        io.emit('userDis', {userName  , leavingMsg:`${userName} left the chat`});
        io.emit('activeUsers', usernames);
    })
    socket.on('dmInstance', ({from , to}) => {
        let recipient = to;
        const userToSend = users[recipient];
        io.to(userToSend).emit('dmInstance', from);
    })
})

httpServer.listen(PORT, () => {
    console.log(`server started running on http://localhost:${PORT}`);
})

