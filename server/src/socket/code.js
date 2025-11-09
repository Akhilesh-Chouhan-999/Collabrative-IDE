export default function handleCodeEvents(io , socket)
{
    socket.on('code-change' , code => {
        if (socket.room) {
            socket.broadcast.to(socket.room).emit('code-update' , code) ;
        }
    }) ;

    socket.on('user-join' ,  data => {
        if (!socket.room) {
            return;
        }

        const room = io.sockets.adapter.rooms.get(socket.room) ; 
        
        if (room && room.size > 0) {
            const roomArray = Array.from(room);
            if (roomArray.length > 0) {
                const lastPerson = roomArray[roomArray.length - 1];
                io.to(lastPerson).emit('accept-info' , data) ; 
            }
        }
    }) ;

    socket.on('language-change' , lang => {
        if (socket.room) {
            io.sockets.in(socket.room).emit('language-update' , lang) ; 
        }
    }) ; 

    socket.on('title-change' , title => {
        if (socket.room) {
            io.sockets.in(socket.room).emit("title-update" , title ) ;
        }
    }) ;


}