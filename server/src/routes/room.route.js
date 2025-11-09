import Router from 'express' ;
import { authenticate } from '../middleware/auth.middleware.js';
import { createRoom, getRoomById, getRoomforUser, joinRoom, leaveRoom  } from '../controllers/room.controller.js';
import { executeCode, getAIRecommendations } from '../controllers/code.controller.js';
const router = Router() ;

router.get('/roomsforuser', authenticate , getRoomforUser) ;
router.post('/createRoom' , authenticate , createRoom) ; 
router.post('/joinRoom/:roomCode' , authenticate , joinRoom);
router.patch('/leaveRoom/:roomCode', authenticate , leaveRoom) ;
router.get("/inaroom/:roomId", authenticate , getRoomById);
router.post('/execute', authenticate, executeCode);
router.post('/ai-recommendations', authenticate, getAIRecommendations);
export default router ; 