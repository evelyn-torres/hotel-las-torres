import express from "express";
const router = express.Router();
import {commentData, reservationData}  from "../data/index.js";
import * as validation from '../helpers.js';

router
    .route('/')
    .get(async (req, res) => {
        try {
            res.render('contact', { partial: 'contact_script' }); 
        } catch (error) {
            res.status(500).json({ error: 'Error displaying comments form' });
        }
    })
    .post(async (req, res) => {
        try {
            const newCommentData = req.body;

            let firstName = newCommentData.firstName; 
            let lastName = newCommentData.lastName; 
            let reservationID = newCommentData.reservationID;
            let feedback = newCommentData.feedback;
            let rating = parseInt(newCommentData.rating);

            // input validation
            firstName = validation.checkString(firstName, "First Name");
            lastName = validation.checkString(lastName, "Last Name"); 
            reservationID = validation.checkString(reservationID, "Reservation ID")
            feedback = validation.checkString(feedback, "Feedback");
    
            if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Invalid or missing rating. It must be a number between 1 and 5.'});
            }
            
            //get room ID for mongo
            // use the reservationID in mongo from seed.js for testing
            let reservation = await reservationData.getReservationById(reservationID)
            if(!reservation) throw 'Error could not find reservation'

            // Save data to the MongoDB collection
            let newCommentInfo = await commentData.createComment(firstName, lastName, reservation.roomID, reservationID, feedback, rating);
            if (!newCommentInfo) throw `Error could not create new list`;

    
        //    return res.status(200).redirect('/contact');
            return res.status(201).render('contact', {
            partial: 'contact_script',
            success: true,
            successMessage: "Thank you for sharing your feedback! We truly value your input. If you have more to share, feel free to fill out the form again!",
        });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error', success: false });
        }
    });
export default router;