import Router from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createRoom, getRoomById, getRoomforUser, joinRoom, leaveRoom, deleteRoom, saveMessage, getRoomMessages } from '../controllers/room.controller.js';
import { executeCode, getAIRecommendations } from '../controllers/code.controller.js';

const router = Router();

router.get('/roomsforuser', authenticate, getRoomforUser);
router.post('/createRoom', authenticate, createRoom);
router.post('/joinRoom/:roomCode', authenticate, joinRoom);
router.patch('/leaveRoom/:roomCode', authenticate, leaveRoom);
router.delete('/deleteRoom/:roomCode', authenticate, deleteRoom);
router.get('/inaroom/:roomId', authenticate, getRoomById);
router.post('/execute', authenticate, executeCode);
router.post('/ai-recommendations', authenticate, getAIRecommendations);
router.post('/messages/:roomId', authenticate, saveMessage);
router.get('/messages/:roomId', authenticate, getRoomMessages);

export default router;