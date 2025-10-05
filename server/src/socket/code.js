export default function handleCodeEvents(io , socket)
{
    socket.on('code-change' , code => {

        socket.broadcast.to(socket.room).emit('code-update' , code) ;

    }) ;

    socket.on('user-join' ,  data => {

        const room = io.sockets.adapters.rooms.get(socket.room) ; 
        const lastPerson = [...room].pop() ; 
        io.to(lastPerson).emit('accept-info' , data) ; 
            
    }) ;

    socket.on('language-change' , lang => {
        io.sockets.in(socket.room).emit('language-update' , lang) ; 

    }) ; 

    socket.on('tittle-change' , tittle => {
        io.sockets.in(socket.room).emity("title-update" , title ) ;

    }) ;


}