import {Router} from 'express';
import * as roomData from '../data/rooms.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        const roomList = await roomData.getAllAvailRooms(); //getAllRooms() show all Available rooms
        return res.json(roomList);
    })

export default router;