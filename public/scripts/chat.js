const username = sessionStorage.getItem('username');

const socket = io('/', {
    query: { username }
});

const roomID = window.location.href.split('/').pop()

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('trigger');

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    const timestamp = new Date().toLocaleDateString();
    console.log('Sending text: ', msg);

    socket.emit('sendNewMessage', {
       message: msg,
       room: roomID,
       username: username,
       timestamp: timestamp
    });
    addMessageToChat(msg, 'sent', username, timestamp);
    messageInput.value = '';
});

socket.on('userNotification', (data) => {
    addNotificationToChat(data.message);
})

socket.emit('joinRoom', roomID);

socket.on('messageReceived', (data) => {
    addMessageToChat(data.message, 'received', data.username, data.timestamp)
    console.log('Another user sent a message', data);
});

function addMessageToChat(message, type, username, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    messageDiv.innerHTML = `
    <strong>${username}</strong> 
    <div>${message}</div>
    <div class="timestamp">${timestamp}</div>
    `;
    
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