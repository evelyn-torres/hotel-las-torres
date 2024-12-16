import {reservations} from '../config/mongoCollections.js';
import {rooms} from "../config/mongoCollections.js"
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import * as guestData from '../data/guests.js';
import {getRoomById} from '../data/rooms.js';


export const getReservationById = async (id) => {
    id = validation.checkId(id, "reservationID");
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
    guestFirstName,
    guestLastName, 
    govID, 
    age,
    phone, 
    email,
    numOfGuests,
    roomID, 
    checkInDate, 
    checkOutDate, 
    parking, 
    totalCost 
) => {

    //validate guest booking inputs
    guestFirstName = validation.checkString(guestFirstName); //name
    guestLastName = validation.checkString(guestLastName);
    //TO-DO: validate govID
    // if (parseInt(age).length !== 2|| !Number.isInteger(parseInt(age))) {//ensure u can only do whole numbers
    //     throw `Error: Invalid Age input ${age}`;
    // }  
    // age = parseInt(age); 
    if (age < 18) throw "Must be 18 years or older to book a room"
    phone = phone.slice(0,3)+phone.slice(4,7)+phone.slice(8); //takes the "-" out
    if (phone.length != 10 || parseInt(phone) < 1111111111 || parseInt(phone) > 9999999999) throw "Error: invalid phone number input";
    //TO-DO: validate email
    const chosenRoom = await getRoomById(roomID);
    let roomCapacity = 0; //room cap: double =2, while twin + semi_double ==1. SO all of that added up is roomCap
    Object.entries(chosenRoom.bedSizes).forEach(elem => {
        if (elem[0] === "Double"){
            roomCapacity +=1;
        }
        roomCapacity += elem[1];

    });
    numOfGuests = parseInt(numOfGuests);
    if (numOfGuests > roomCapacity) throw "Error: Guest number exceeds room capacity";

    //TO-DO: make seperate check booking function
    //basically, go from check-in to check out and see if any dates in booked column

    const begin = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end.getTime() - begin.getTime() < 0) throw "Booking Error: Check-Out date must be after Check-In Date.";
    if (end.getTime()-begin.getTime() > 2678400000) throw "Booking Error: Per our Hotel Policy, You cannot book a room for more than 31 days. Please select another date.";
    const daysBooked = end.getDate()-begin.getDate();
    let curr = begin.valueOf();
    for (let i = 0; i < daysBooked; i++){
        if (chosenRoom.availability.booked.includes(new Date(curr).toISOString().slice(0,10))){ //if room is booked, ask to book another range
            throw `Booking Error: Room is booked on ${new Date(curr).toISOString().slice(0,10)}, please select another date.`
            break;
        }
        else if(chosenRoom.availability.open.includes(new Date(curr).toISOString().slice(0,10))){ //if room is open, check each date and add to current
            let selectDate = new Date(curr).toISOString().slice(0,10); //set date to add to booked
            chosenRoom.availability.open = chosenRoom.availability.open.filter(x => x !== selectDate); //remove from open array
            chosenRoom.availability.booked.push(selectDate) // add it to booked column
            if (chosenRoom.availability.open.includes(selectDate) || !chosenRoom.availability.booked.includes(selectDate)) throw `Booking Error: Failure to Book on ${selectDate}`;
            curr += 86400000;
        }
        else{ //date isn't offered, choose another day
            throw `Booking Error: We currently aren't offering this room on ${new Date(curr).toISOString().slice(0,10)}, please select another date.`
        }
    }
    
    // if(arguments.length !== 8) throw "Please include all inputs"

    //checks for guest ID
    // if (!Array.isArray(guestIDs) || guestIDs.length === 0) {
    //     throw "guestIDs must be a non-empty array of valid guest IDs";
    // }

    //checks for parking 

    //checks for deposit paid 

    //checks for totalCost 
    //console.log('avail check', chosenRoom.availability);
    const reservationCollection = await reservations();
    let newReservation = {
        guestFirstName: guestFirstName,
        guestLastName: guestLastName, 
        govID: govID, 
        age: age,
        phone: phone, 
        email: email,
        numOfGuests: numOfGuests,
        roomID: roomID, 
        checkInDate: checkInDate, 
        checkOutDate: checkOutDate, 
        daysBooked: daysBooked,
        parking: parking, 
        totalCost: totalCost  
    };

    const insertInfo = await reservationCollection.insertOne(newReservation);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add reservation';
    console.log("reserve input", insertInfo);
    const newId = insertInfo.insertedId.toString();
    const reservation = await getReservationById(newId); 

    //update room in db
    const roomCollection = await rooms();
    await roomCollection.updateOne({_id: new ObjectId(chosenRoom._id)}, {$set: {availability: chosenRoom.availability}})
    console.log("newly booked", await getRoomById(roomID));

    return reservation;
}

export const removeReservation = async(id) => {
    id = validation.checkId(id);
    const reservationCollection = await reservations();
    const deletionInfo = await reservationCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Could not delete reservation with id of ${id}`;
    return {...deletionInfo, deleted: true};
};

//console.log(await createReservation("Wes","Nabo", "4fr78wf7r8",21,"832-612-6236","wesleynabo@gmail.com",2,"675b0bc6bec1f311dfd54569", "2025-01-07","2025-01-12","on",0));