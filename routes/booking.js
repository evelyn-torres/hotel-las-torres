import {Router} from 'express';
import * as bookingData from '../data/booking.js';


const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        try{
            const bookingInfo = await bookingData.getBookingById();
            res.render('booking', {booking: bookingInfo, pageTitle: "Book your Stay Now!"});
        }catch(e){
            res.status(500).json({error:e});
        }
        //res.render('booking', {pageTitle: "Book Now"})
    })

export default router;