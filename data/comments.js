import {comments} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import * as guestData from './guests.js';
import * as roomData from './rooms.js';
import * as reservationData from './reservations.js'

export const getCommentById = async (id) => {
    id = validation.checkId(id, "comment id")
    const commentCollection = await comments();
    const comment = await commentCollection.findOne({_id: new ObjectId(id)});
    if (comment === null) throw 'No comment with that id';
    comment._id = comment._id.toString();
    return comment;
}

export const getAllComments = async() => {
    const commentCollection = await comments();
    return await commentCollection.find({}).toArray();
}

export const createComment = async(
    firstName, 
    lastName,
    roomID, 
    reservationID, 
    feedback, 
    rating
) => {
    
    //checks for guestID
    // guestID = validation.checkId(guestID, "Guest ID");
    // const guest = await guestData.getGuestById(guestID); //make sure the guest exists

    // //checks for roomID
    // roomID = validation.checkId(roomID, "Room ID");
    // const room = await roomData.getRoomById(roomID); //make sure the room exists

    //checks for reservationID
    // reservationID = validation.checkId(reservationID, "Reservation ID");
    // const reservation = await reservationData.getReservationById(reservationID); //make sure the room exists

    //checks for feedback 
    feedback = validation.checkString(feedback, "Feedback")

    //checks for rating 
    if(typeof rating !== 'number') throw "Type of rating must be a number"

    //need to make sure the reservation id exists in the database to confirm the reservation occured.
    const reservation = await reservationData.getReservationById(reservationID);
    if (!reservation) {
        throw `No reservation found with ID: ${reservationID}`;
    }

    if (reservation.roomID !== roomID) {
        throw `Room ID does not match the reservation's room.`;
    }

    const commentCollection = await comments();
    let newComment = {
        firstName: firstName, 
        lastName: lastName, 
        roomID: roomID, 
        reservationID: reservationID, 
        feedback: feedback, 
        rating: rating,
    };

    const insertInfo = await commentCollection.insertOne(newComment);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add comment';
      
    const newId = insertInfo.insertedId.toString();
    const comment = await getCommentById(newId); 
    return comment;
}
