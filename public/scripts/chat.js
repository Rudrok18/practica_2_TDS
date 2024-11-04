const socket = io('/');

const roomID = window.location.href.split('/').pop()

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('trigger');

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    console.log('Sending text: ', msg);

    socket.emit('sendNewMessage', {
       message: msg,
       room: roomID
    });
    addMessageToChat(msg, 'sent');
    messageInput.value = '';
});

socket.on('userNotification', (data) => {
    addNotificationToChat(data.message);
})

socket.emit('joinRoom', roomID);

socket.on('messageReceived', (data) => {
    addMessageToChat(data.message, 'received')
    console.log('Another user sent a message', data);
});

function addMessageToChat(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addNotificationToChat(message){
    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('notification');
    notificationDiv.textContent = message;
    chatMessages.appendChild(notificationDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}