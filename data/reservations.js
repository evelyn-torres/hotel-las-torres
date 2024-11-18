import {reservations} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import * as guestData from '../data/guests.js';
import * as roomData from '../data/rooms.js';


export const getReservationById = async (id) => {
    id = validation.checkId(id, "reservation id")
    const reservationCollection = await reservations();
    const reservation = await reservationCollection.findOne({_id: new ObjectId(id)});
    if (reservation === null) throw 'No reservation with that id';
    reservation._id = reservation._id.toString();
    return reservation;
}

export const getAllReservations = async() => {
    const reservationCollection = await reservations();
    return await reservationCollection.find({}).toArray();
}

export const createReservation = async(
    guestIDs, 
    numOfGuests,
    roomID, 
    checkInDate, 
    checkOutDate, 
    parking, 
    depositPaid, 
    totalCost 
) => {

    // if(arguments.length !== 8) throw "Please include all inputs"

    //checks for guest ID
    if (!Array.isArray(guestIDs) || guestIDs.length === 0) {
        throw "guestIDs must be a non-empty array of valid guest IDs";
    }

    const validatedGuestIDs = [];
    for (let guestID of guestIDs) {
        guestID = validation.checkId(guestID, "Guest ID");
        await guestData.getGuestById(guestID); // make sure that the guest exists
        validatedGuestIDs.push(new ObjectId(guestID));
    }
    guestIDs = validatedGuestIDs;

    //checks for numOfGuests

    //checks for roomID
    roomID = validation.checkId(roomID, "Room ID");
    const room = await roomData.getRoomById(roomID); //make sure the room exists
    roomID = new ObjectId(roomID)

    //checks for check in date 

    //checks for check out date 

    //checks for parking 

    //checks for deposit paid 

    //checks for totalCost 

    const reservationCollection = await reservations();
    let newReservation = {
        guestIDs: guestIDs, 
        numOfGuests: numOfGuests,
        roomID: roomID, 
        checkInDate: checkInDate, 
        checkOutDate: checkOutDate, 
        parking: parking, 
        depositPaid: depositPaid, 
        totalCost: totalCost 
    };

    const insertInfo = await reservationCollection.insertOne(newReservation);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add reservation';
      
    const newId = insertInfo.insertedId.toString();
    const reservation = await getReservationById(newId); 
    return reservation;
}
