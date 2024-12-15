import express from "express";
const router = express.Router();
import {commentData, reservationData}  from "../data/index.js";
import validation from '../helpers.js';

router
    .route('/')
    .get(async (req, res) => {
        try {
            const commentList = await commentData.getAllComments();
            res.render('contact', { 
                partial: 'contact_script', 
                comments: commentList}); 
        } catch (error) {
            res.status(500).render(
                'contact', {
                partial: 'contact_script',
                error: 'An error occurred while loading the contact page.'
              });
            
                
        }
    })
    .post(async (req, res) => {
        try {
            const { firstName, lastName, reservationID, feedback, rating } = req.body;


            console.log(req.body);
            // input validation;
            firstName = validation.checkString(firstName, "First Name");
            lastName = validation.checkString(lastName, "Last Name"); 
            reservationID = validation.checkString(reservationID, "Reservation ID")
            feedback = validation.checkString(feedback, "Feedback");
    
            
            if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
                console.log("in the rating 400");
                return res.status(400).json({ error: 'Invalid or missing rating. It must be a number between 1 and 5.'});
            }
            
            //get room ID for mongo
            // use the reservationID in mongo from seed.js for testing
            let reservation = await reservationData.getReservationById(reservationID)
            
            if(!reservation){
            
                //throw 'Error could not find reservation'
                return res.status(404).json({error: 'Reservation not found.'});
            } 


            // Save data to the MongoDB collection
            let newCommentInfo = await commentData.createComment(
                firstName, 
                lastName, 
              //  reservation.roomID, 
                reservationID, 
                feedback, 
                rating);

            if (!newCommentInfo) {
                return res.status(500).json({error: 'Failed to create comment.'});
               }

            const updatedComments = await commentData.getAllComments();

    
        //    return res.status(200).redirect('/contact');
             res.status(201).render('contact', {
                partial: 'contact_script',
                success: true,
                successMessage: "Thank you for sharing your feedback! We truly value your input. If you have more to share, feel free to fill out the form again!",
                comments: updatedComments
        });
        } catch (error) {
            //console.error(error);
            const commentList = await commentData.getAllComments();
            console.log(commentList);
            console.log("in the 400 in catch");
            res.status(400).render('contact', {
                partial: 'contact_script',
                error: error.message,
                comments: commentList
            });
        }
    });
export default router;