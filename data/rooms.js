import {rooms} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';

export const createRoom = async (
    roomName, 
    balcony, 
    bedSizes, 
    pricingPerNight, 
    availability
  ) => {
    //checks for numRooms 
    if(!roomName) throw "You must provide the number of rooms";
    roomName = validation.checkString(roomName);
    
    //checks for balcony 
    if(!balcony) throw "You must provide a value for balcony";
    if(typeof balcony !== "boolean") throw "Please indicate True or False for whether the room has a balcony or not.";

    //checks for bedSizes
    if(!bedSizes) throw "You must provide a value for bedSizes";
    if(typeof bedSizes !== "object") throw "You must provide bedSizes as an object";

    //checks for pricingPerNight 
    if(!pricingPerNight) throw "You mut provide a value for pricingPerNight"; 
    if(typeof pricingPerNight !== "number") throw "pricingPerNight must be a number";

    //checks for availability 
    //requires further checks for inside the object 
    if(!availability) throw "You must provide the availability for the room";
    if(typeof availability !== "object") throw "availability must be an object";

    const roomCollection = await rooms();
    let newRoom = {
        roomName: roomName, 
        balcony: balcony, 
        bedSizes: bedSizes, 
        pricingPerNight: pricingPerNight, 
        availability: availability
    };

    const insertInfo = await roomCollection.insertOne(newRoom);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add room';
      
    const newId = insertInfo.insertedId.toString();
    const room = await getRoomById(newId); 
    return room;
}

export const getRoomById = async (id) => {
    id = validation.checkId(id, "id")
    const roomCollection = await rooms();
    const room = await roomCollection.findOne({_id: new ObjectId(id)});
    if (room === null) throw 'No room with that id';
    room._id = room._id.toString();
    return room;
};

export const getAllRooms = async() => {
    const roomCollection = await rooms();
    return await roomCollection.find({}).toArray();
}



