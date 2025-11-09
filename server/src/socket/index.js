import { Server } from "socket.io";
import handleRoomEvents from "./room.js";
import handleCodeEvents from "./code.js";
import handleChatEvents from "./chat.js";

export default function setupSocket(httpServer)
{

     const io = new Server(httpServer, {

    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection' , socket =>
  {

    console.log(`User connected: ${socket.id}`) ;
    
    handleRoomEvents(io, socket);
    handleCodeEvents(io, socket);
    handleChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  }
  )
      
}