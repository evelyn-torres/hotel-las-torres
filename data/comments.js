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
    guestID, 
    roomID, 
    reservationID, 
    feedback, 
    rating
) => {
    
    //checks for guestID
    guestID = validation.checkId(guestID, "Guest ID");
    const guest = await guestData.getGuestById(guestID); //make sure the guest exists
    guestID = new ObjectId(guestID)

    //checks for roomID
    roomID = validation.checkId(roomID, "Room ID");
    const room = await roomData.getRoomById(roomID); //make sure the room exists
    roomID = new ObjectId(roomID)

    //checks for reservationID
    reservationID = validation.checkId(reservationID, "Reservation ID");
    const reservation = await reservationData.getReservationById(reservationID); //make sure the room exists
    reservationID = new ObjectId(reservationID)

    //checks for feedback 
    feedback = validation.checkString(feedback, "Feedback")

    //checks for rating 
    if(typeof rating !== 'number') throw "Type of rating must be a number"

    const commentCollection = await comments();
    let newComment = {
        guestID: guestID, 
        roomID: roomID, 
        reservationID: reservationID, 
        feedback: feedback, 
        rating: rating
    };

    const insertInfo = await commentCollection.insertOne(newComment);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add reservation';
      
    const newId = insertInfo.insertedId.toString();
    const comment = await getCommentById(newId); 
    return comment;
}
