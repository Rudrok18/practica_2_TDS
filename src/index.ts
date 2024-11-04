import express from 'express';
import { config } from 'dotenv';
config();

import path from 'path';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 5000;

app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/chat/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

const server = app.listen(port, () => {
    console.log(`App is running in port ${port}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Client logged in');

    socket.broadcast.emit('userNotification', { message: 'User joined the chat'});

    socket.on('joinRoom', (roomID) => {
        socket.join('room-' + roomID);
        console.log(`Joined room: room-${roomID}`);
    });

    socket.on('sendNewMessage', (data) => {
        console.log('You got a message: ', data);
        
        // io.emit()
        //socket.broadcast.emit(data);
        socket.to('room-' + data.room).emit('messageReceived', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconected');
        socket.broadcast.emit('userNotification', { message: 'User left the chat'});
    });
});