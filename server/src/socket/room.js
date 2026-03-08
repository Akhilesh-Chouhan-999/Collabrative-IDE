// Track online users per room: { roomId: Map<socketId, { username, userId }> }
const onlineUsers = new Map();

export default function handleRoomEvents(io, socket) {

    socket.on('created-room', (roomId) => {
        if (!onlineUsers.has(roomId)) {
            onlineUsers.set(roomId, new Map());
        }
    });

    socket.on('join-room', (msg) => {
        socket.room = msg.id;
        socket.username = msg.nameOfUser;
        socket.join(msg.id);

        // Track online user
        if (!onlineUsers.has(msg.id)) {
            onlineUsers.set(msg.id, new Map());
        }
        onlineUsers.get(msg.id).set(socket.id, {
            username: msg.nameOfUser,
            socketId: socket.id,
        });

        const room = io.sockets.adapter.rooms.get(socket.room);

        if (room && room.size > 1) {
            const first = room.values().next().value;
            io.to(first).emit('request-info', '');
        }

        // Notify everyone about the join
        socket.emit('receive-message', {
            sender: 'System',
            text: `Welcome! You joined the room.`,
            timestamp: new Date().toISOString(),
        });

        socket.broadcast.to(socket.room).emit('receive-message', {
            sender: 'System',
            text: `${msg.nameOfUser} has joined!`,
            timestamp: new Date().toISOString(),
        });

        // Broadcast updated online users list
        broadcastOnlineUsers(io, socket.room);
    });

    socket.on('leaving', () => handleLeaving(io, socket));
    socket.on('disconnecting', () => handleLeaving(io, socket));
}

function broadcastOnlineUsers(io, roomId) {
    if (!roomId || !onlineUsers.has(roomId)) return;
    const users = Array.from(onlineUsers.get(roomId).values());
    io.sockets.in(roomId).emit('online-users', users);
}

function handleLeaving(io, socket) {
    try {
        const roomId = socket.room;
        if (!roomId) return;

        // Remove user from online tracking
        if (onlineUsers.has(roomId)) {
            onlineUsers.get(roomId).delete(socket.id);

            // Clean up empty rooms
            if (onlineUsers.get(roomId).size === 0) {
                onlineUsers.delete(roomId);
            }
        }

        // Notify others
        if (socket.username) {
            socket.broadcast.to(roomId).emit('receive-message', {
                sender: 'System',
                text: `${socket.username} has left.`,
                timestamp: new Date().toISOString(),
            });
        }

        const room = io.sockets.adapter.rooms.get(roomId);

        if (room) {
            io.sockets.in(roomId).emit('joined-users', room.size - 1);

            if (room.size === 1) {
                socket.leave(roomId);
            }
        }

        // Broadcast updated online users
        broadcastOnlineUsers(io, roomId);
    } catch (error) {
        console.log('Error leaving room', error);
    }
}