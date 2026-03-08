import { Server } from "socket.io";
import handleRoomEvents from "./room.js";
import handleCodeEvents from "./code.js";
import handleChatEvents from "./chat.js";

export default function setupSocket(httpServer) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:7000" ,
        "http://localhost:5174",
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    handleRoomEvents(io, socket);
    handleCodeEvents(io, socket);
    handleChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}