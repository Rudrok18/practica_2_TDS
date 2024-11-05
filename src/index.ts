import express from 'express';
import { config } from 'dotenv';

config();

import path from 'path';
import { Server } from 'socket.io';
import session from 'express-session';

const app = express();
const port = process.env.PORT || 5000;

const sessionSecret = process.env.SECRET_KEY || 'default';

declare module 'express-session' {
    interface Session {
        username?: string;
    }
}

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/chat/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use((req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    next();
})

app.post('/login', (req, res) => {
    const { username } = req.body;
    req.session.username = username;
    res.redirect('/home');
})

const server = app.listen(port, () => {
    console.log(`App is running in port ${port}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    const username = socket.handshake.query.username as string;
    console.log('Client logged in');

    socket.broadcast.emit('userNotification', { message: `${username} joined the chat`});

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