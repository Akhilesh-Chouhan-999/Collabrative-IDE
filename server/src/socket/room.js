const rooms = [] ; 
const removeRooms = [] ; 

function getLastValue(set)
{
    let value ; 
    for(value of set) ; 

    return value ; 
}


export default function handleRoomEvents(io , socket)
{
    socket.on('created-room' , roomId => {
        rooms.push(roomId) ; 
    }) ; 


    socket.on('join-room' , msg => {
        
        socket.room = msg.id ; 
        socket.join(msg.id) ; 

        const room = io.sockets.adapter.rooms.get(socket.room) ; 

        if(room.size > 1 )
        {
            const first = room.values().next().value ;
             io.to(first).emit("request-info" , "") ;
        }

        socket.emit('receive-message' , {
            sender : 'admin' , 
            text : `${msg.nameOfUser} has joined!`
        }) ;

        socket.broadcast.to(socket.room).emit('receive-message' , 
            {
                 sender: "admin", 
                 text: `${msg.nameOfUser} has joined!`
            }
        ) ;

    }) ;

    socket.on('leaving' , () => handleLeaving(io , socket)) ; 
    socket.on('disconnecting' , () => handleLeaving(io , socket)) ; 

}


function handleLeaving(io , socket)
{
    try {
       
        const room = io.sockets.adapter.rooms.get(socket.room) ;

        if(room)
        {
            io.sockets.in(socket.room).emit('joined-users' , room.size - 1) ; 

            if(room.size === 1)
            {
                socket.leave(socket.room) ; 
                removeRooms.push(socket.room) ; 
            }
        }
    } 
    
    catch (error) {
        
        console.log('Error leaving room ' , error) ; 
    }
}