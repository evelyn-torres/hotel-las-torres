import express from "express";
const router = express.Router();
import {commentData}  from "../data/index.js";

router
    .route('/')
    .get(async (req, res) => {
        try {
            res.render('contact', { partial: 'contact_script' }); 
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    })
    .post(async (req, res) => {
        try {
            const newCommentData = req.body;

            let reservationID = newCommentData.reservationID;
            let feedback = newCommentData.feedback;
            let rating = newCommentData.rating;

            console.log(reservationID)
            console.log(feedback)
            console.log(rating)

            //input data validation
    
            // Save data to the MongoDB collection
            let newCommentInfo = await commentData.createComment("testing", "testing2", reservationID, feedback, rating);
            if (!newCommentInfo) throw `Error could not create new comment`;
    
            res.status(201).json({ success: true, message: 'Your message has been received!', data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

export default router;