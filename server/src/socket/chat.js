export default function handleChatEvents(io, socket) {

    socket.on('sendMessage', ({ message, sender }) => {
        if (socket.room) {
            io.to(socket.room).emit('receive-message', {
                sender,
                text: message,
                timestamp: new Date().toISOString(),
            });
        }
    });
}