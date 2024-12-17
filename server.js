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
    socket.on('dmAcceptedRecipient', ({from, to}) => {
        const senderSocketId = users[from];
        const toSocketId = users[to];
        const room = `${from}-${to}`;
        if(senderSocketId && toSocketId){
            socket.join(room);
            io.to(senderSocketId).emit('dmAccepted',{room:room , to:to});
            io.to(toSocketId).emit('dmAccepted',{room, from:from});
        }
    })
    socket.on('dmAcceptedSender', (room) => {
        socket.join(room);
    })
    socket.on('dmRejected', ({from ,to}) => {
        const senderSocketId = users[from];
        io.to(senderSocketId).emit('dmRejected', `${to} rejected your dm request.`);
    })
    socket.on('privateMsg', ({room, message, sender}) => {
        io.to(room).emit('privateMsg', {sender, message});
    })
    socket.on('joinroom', (room) => {
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
    });
})


httpServer.listen(PORT, () => {
    console.log(`server started running on http://localhost:${PORT}`);
})

