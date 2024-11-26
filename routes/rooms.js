import {Router} from 'express';
const router = Router();
import {roomData} from '../data/index.js';


router
    .route('/')
    .get(async (req, res) => {
        try {
        const roomList = await roomData.getAllRooms();
        res.render('rooms', {rooms: roomList, pageTitle: "Rooms", partial: 'rooms'});
        } catch (e) {
          res.status(500).json({error: e});
        }
    })

export default router;