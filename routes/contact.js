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
            // use reservationID '67509f6d7d481acee304189e' for testing
            let reservation = await reservationData.getReservationById(reservationID)
            if(!reservation) throw 'Error could not find reservation'

            // Save data to the MongoDB collection
            let newCommentInfo = await commentData.createComment(firstName, lastName, reservation.roomID, reservationID, feedback, rating);
            if (!newCommentInfo) throw `Error could not create new list`;

    
        //    return res.status(200).redirect('/contact');
           return res.status(201).json({success: true, data: newCommentInfo})
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
export default router;