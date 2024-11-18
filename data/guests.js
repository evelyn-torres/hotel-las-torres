import {guests} from '../config/mongoCollections.js';
// import roomData from './rooms.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';


export const getGuestById = async (id) => {
    id = validation.checkId(id, "guest id")
    const guestCollection = await guests();
    const guest = await guestCollection.findOne({_id: new ObjectId(id)});
    if (guest === null) throw 'No guest with that id';
    guest._id = guest._id.toString();
    return guest;
}

export const getAllGuests = async() => {
    const guestCollection = await guests();
    return await guestCollection.find({}).toArray();
}

export const createGuest = async(
    guestFirstName, 
    guestLastName,
    guestAge, 
    govID, 
    phoneNumber, 
    email 
) => {
    //checks for first name
    if (!guestFirstName) throw 'You must provide a first name for the guest';
    guestFirstName = validation.checkString(guestLastName, "Guest First Name");

    //checks for last name 
    if(!guestLastName) throw "You must provide a last name for the guest";
    guestLastName = validation.checkString(guestLastName, "Guest Last Name");

    //checks for guestAge 
    if(!guestAge) throw "You must provide an age for the guest";
    if(typeof guestAge !== "number") throw "Guest age must be a number";

    //checks for govID
    if(!govID) throw "You must provide a government ID";
    govID = validation.checkString(govID, "GovID");

    //checks for phoneNumber
    if(!phoneNumber) throw "You must provide a phone number";
    if(typeof phoneNumber !== "number") throw "Phone number must consist of only numbers";

    //checks for email 
    if(!email) throw "You must provide an email address";
    email = validation.checkString(email, "Guest email")

    const guestCollection = await guests();
    let newGuest = {
        guestFirstName: guestFirstName, 
        guestLastName: guestLastName, 
        guestAge: guestAge, 
        govID: govID, 
        phoneNumber: phoneNumber,
        email: email
    };

    const insertInfo = await guestCollection.insertOne(newGuest);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add guest';
      
    const newId = insertInfo.insertedId.toString();
    const guest = await getGuestById(newId); 
    return guest;
}
