import {reservations} from '../config/mongoCollections.js';
import {rooms} from "../config/mongoCollections.js"
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import * as guestData from '../data/guests.js';
import {getRoomById} from '../data/rooms.js';
import crypto from 'crypto'; 
import validator from 'validator';
//import { sendEmailConfirmation } from '../utils/emailService.js';


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
    roomId, 
    checkInDate, 
    checkOutDate, 
    parking, 
    totalCost 
) => {

    const reservationCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    //validate guest booking inputs
    guestFirstName = validation.checkString(guestFirstName); //name
    if(guestFirstName.length < 2 ) throw "First name must be longer than 2 characters"; 
    if(guestFirstName.length > 25) throw "First name must be shorter than 25 characters";
    
    guestLastName = validation.checkString(guestLastName);
    if(guestLastName.length < 2 ) throw "Last name must be longer than 2 characters"; 
    if(guestLastName.length > 25) throw "Last name must be shorter than 25 characters";
    //TO-DO: validate govID
    // if (parseInt(age).length !== 2|| !Number.isInteger(parseInt(age))) {//ensure u can only do whole numbers
    //     throw `Error: Invalid Age input ${age}`;
    // }  
    // age = parseInt(age); 
    if (age < 18) throw "Must be 18 years or older to book a room";
    if (age > 120) throw "Please enter a valid age"
    phone = phone.slice(0,3)+phone.slice(4,7)+phone.slice(8); //takes the "-" out
    if (phone.length != 10 || parseInt(phone) < 1111111111 || parseInt(phone) > 9999999999) throw "Error: invalid phone number input";
    //TO-DO: validate email
    const chosenRoom = await getRoomById(roomId);
    console.log(chosenRoom)
    let roomCapacity = 1; //room cap: double =2, while twin + semi_double ==1. SO all of that added up is roomCap

    let beds = Object.keys(chosenRoom.bedSizes);
    let numOfBeds = Object.values(chosenRoom.bedSizes);

    for(let x in beds) {
        if(beds[x] === "Double" || beds[x] === "Doble" ) {
            roomCapacity += numOfBeds[x] * 2; 
        }
        if(beds[x] === "Semi-Double" || beds[x] === "Semi-Doble") {
            roomCapacity += numOfBeds[x]; 
        }
        if(beds[x] === "Twin") {
            roomCapacity += numOfBeds[x];
        }
    }

    console.log(beds) 
    console.log(numOfBeds)
    console.log(roomCapacity)

    numOfGuests = parseInt(numOfGuests);
    if (numOfGuests > roomCapacity) throw `Error: Guest number exceeds room capacity. The room capacity is ${roomCapacity}`;

    //TO-DO: make seperate check booking function
    //basically, go from check-in to check out and see if any dates in booked column

    const begin = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (end.getTime() <= begin.getTime() ) throw "Booking Error: Check-Out date must be after Check-In Date.";
    
    //if (end.getTime()-begin.getTime() > 2678400000) throw "Booking Error: Per our Hotel Policy, You cannot book a room for more than 31 days. Please select another date.";
    const msDiff = end.getTime() - begin.getTime();
    if(msDiff > 2678400000 ) throw "Booking Error: Per our Hotel Policy, You cannot book a room for more than 31 days. Please select another date.";
    
   // const daysBooked = end.getDate()-begin.getDate();

   // compute number of nights (treat checkOut as exclusive)
    const nights = Math.round(msDiff / 86400000); // whole days difference

    // iterate each day from check-in (inclusive) for `nights` days
    let curr = begin.getTime();
    for (let i = 0; i < nights; i++){
        const dateStr = new Date(curr).toISOString().slice(0,10); //YYYY-MM-DD

        if(Array.isArray(chosenRoom.availability.booked) && chosenRoom.availability.booked.includes(dateStr)){
            throw `Booking Error: Room is already booked on ${dateStr}, please select another date.`;
        }

        if (Array.isArray(chosenRoom.availability.open) && chosenRoom.availability.open.includes(dateStr)){
            chosenRoom.availability.open = chosenRoom.availability.open.filter(x => x !== dateStr);
            chosenRoom.availability.booked = chosenRoom.availability.booked || [];
            chosenRoom.availability.booked.push(dateStr);
            
            if (!chosenRoom.availability.booked.includes(dateStr)) {
                throw `Booking Error: Failure to book ${dateStr}`;
                }
        } else{
            throw `Booking Error: We currently aren't offering this room on ${dateStr}, please select another date.`;
        }

        curr += 24 * 60 * 60 * 1000; //go up a day
    }
    const daysBooked = nights;

    //     if (chosenRoom.availability.booked.includes(new Date(curr).toISOString().slice(0,10))){ //if room is booked, ask to book another range
    //         throw `Booking Error: Room is booked on ${new Date(curr).toISOString().slice(0,10)}, please select another date.`
    //         break;
    //     }
    //     else if(chosenRoom.availability.open.includes(new Date(curr).toISOString().slice(0,10))){ //if room is open, check each date and add to current
    //         let selectDate = new Date(curr).toISOString().slice(0,10); //set date to add to booked
    //         chosenRoom.availability.open = chosenRoom.availability.open.filter(x => x !== selectDate); //remove from open array
    //         chosenRoom.availability.booked.push(selectDate) // add it to booked column
    //         if (chosenRoom.availability.open.includes(selectDate) || !chosenRoom.availability.booked.includes(selectDate)) throw `Booking Error: Failure to Book on ${selectDate}`;
    //         curr += 86400000;
    //     }
    //     else{ //date isn't offered, choose another day
    //         throw `Booking Error: We currently aren't offering this room on ${new Date(curr).toISOString().slice(0,10)}, please select another date.`
    //     }
    // }
    
    //checks for govID
    govID = validation.checkGovId(govID)
    if(govID.length < 8) throw "Government ID must be at least 8 characters"; 
    if(govID.length > 20) throw "Government ID must be less than 20 characters";
    if(govID.includes(" ")) throw "Government ID must not have spaces in between";

    //checks for email validation
    if(!validator.isEmail(email)){
        throw 'Invalid email address.';
    }
    //checks for totalCost 
    console.log('avail check', chosenRoom.availability);
    const reservationCollection = await reservations();
    let newReservation = {
        guestFirstName: guestFirstName,
        guestLastName: guestLastName, 
        govID: govID, 
        age: age,
        phone: phone, 
        email: email,
        numOfGuests: numOfGuests,
        roomId: roomId, 
        checkInDate: checkInDate, 
        checkOutDate: checkOutDate, 
        daysBooked: daysBooked,
        parking: parking, 
        totalCost: totalCost  ,
        reservationCode: reservationCode
    };

    const insertInfo = await reservationCollection.insertOne(newReservation);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add reservation';
    console.log("reserve input", insertInfo);
    const newId = insertInfo.insertedId.toString();
    const reservation = await getReservationById(newId); 

    //update room in db
    const roomCollection = await rooms();
    console.log("before update booked:", chosenRoom.availability.booked);

    const checkRoom = await roomCollection.findOne({_id: new ObjectId(chosenRoom._id)});
    console.log("after update booked in DB:", checkRoom.availability.booked);

    await roomCollection.updateOne({_id: new ObjectId(chosenRoom._id)}, {$set: {availability: chosenRoom.availability}})
    console.log("newly booked", await getRoomById(roomId));

    
   //await sendEmailConfirmation(email, reservation);
    console.log('after email confirmation.');
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