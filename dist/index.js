"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const sessionSecret = process.env.SECRET_KEY || 'default';
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.get('', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'login.html'));
});
app.get('/chat/:id', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'chat.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
app.use((req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    next();
});
app.post('/login', (req, res) => {
    const { username } = req.body;
    req.session.username = username;
    res.redirect('/home');
});
const server = app.listen(port, () => {
    console.log(`App is running in port ${port}`);
});
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    console.log('Client logged in');
    socket.broadcast.emit('userNotification', { message: `${username} joined the chat` });
    socket.on('joinRoom', (roomID) => {
        socket.join('room-' + roomID);
        console.log(`Joined room: room-${roomID}`);
    });
    socket.on('sendNewMessage', (data) => {
        console.log('You got a message: ', data);
        // io.emit()
        //socket.broadcast.emit(data);
        socket.to('room-' + data.room).emit('messageReceived', {
            message: data.message,
            username: data.username,
            timestamp: data.timestamp
        });
    });
    socket.on('disconnect', () => {
        console.log('User disconected');
        socket.broadcast.emit('userNotification', { message: 'User left the chat' });
    });
});
