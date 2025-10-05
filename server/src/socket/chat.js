export default function handleChatEvents(io, socket) {
    socket.on('sendMessage',

        ({ message, sender }) => {
            io.to(socket.room).emit('receive-message', 
                { sender, text: message })
        } ) ;

} 