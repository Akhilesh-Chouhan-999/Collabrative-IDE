import express from 'express' ; 
import http from 'http' ;
import dotenv from 'dotenv' ;
import cors from 'cors';
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js'
import roomRoutes from './routes/room.route.js'
import setupSocket from './socket/index.js';
 
const app = express() ;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()) ; 


dotenv.config() ; 



const httpServer = http.createServer(app);


const PORT = process.env.PORT ; 

app.use("/api/auth", authRoutes);
app.use("/api/room" , roomRoutes )

setupSocket(httpServer);

httpServer.listen(PORT , () => {
    
    console.log(`Server is running at port number ${PORT}`) ; 
    connectDB()   ; 

})
