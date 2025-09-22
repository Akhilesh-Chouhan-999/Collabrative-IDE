import express from 'express' ; 
import dotenv from 'dotenv' ;
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js'
import roomRoutes from './routes/room.route.js'
 
const app = express() ;

app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()) ; 


dotenv.config() ; 

const PORT = process.env.PORT  ; 


app.use("/api/auth", authRoutes);
app.use("/api/room" , roomRoutes )



app.listen(PORT , () => {
    
    console.log(`Server is running at port number ${PORT}`) ; 
    connectDB() ; 

})
