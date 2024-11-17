import {Router} from 'express';
import * as bookingFuncs from '../data/booking.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        res.render('booking', {pageTitle: "Book Now"})
    })

export default router;