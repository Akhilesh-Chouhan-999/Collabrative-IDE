import { Router } from "express";
import { authLogout, authLogin, authRegister } from "../controllers/auth.controller.js";

const router = Router() ;

router.post('/register' ,authRegister) ;
router.post( '/login'  , authLogin) ;
router.delete('/logout' , authLogout ) ; 

export default router ; 
