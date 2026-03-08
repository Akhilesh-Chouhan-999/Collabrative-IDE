import { Router } from "express";
import { authLogout, authLogin, authRegister, checkAuth } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', authRegister);
router.post('/login', authLogin);
router.delete('/logout', authLogout);
router.get('/me', authenticate, checkAuth);

export default router;
