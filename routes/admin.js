import {Router} from 'express';
import * as adminData from '../data/admin.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        //const roomList = await admin.getAllAvailRooms(); //getAllRooms() show all Available rooms
        return res.json();
    })


export default router;