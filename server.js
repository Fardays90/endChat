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
io.on('connect', (socket) => {
    let userName;
    socket.on('username',(username) => {
        userName = username;
        console.log(userName+' connected!');
        users[username] = socket.id;
        io.emit('userJoined', userName+' joined the chat.');
    })
    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage',{userName, msg});
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
        io.emit('userDis', userName+' left the chat.');
    })
    socket.on('dm', ({personToSend, msg }) => {
        const personId = users[personToSend];
        if(personId){
            io.to(personId).emit('dm', {
                from: userName,
                msg
            })
        }
        else{
            socket.emit('dm', 'person is not online');
        }
    })
})

httpServer.listen(PORT, () => {
    console.log(`server started running on http://localhost:${PORT}`);
})

