import {rooms} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';



export const getRoomById = async (id) => {
    id = validation.checkId(id, "room id")
    const roomCollection = await rooms();
    const room = await roomCollection.findOne({_id: new ObjectId(id)});
    if (room === null) {
        console.error(`No room with ID ${id}`);
        throw 'No room with that id';
    }
    room._id = room._id.toString();
    return room;
};

export const getAllRooms = async() => {
    const roomCollection = await rooms();
    return await roomCollection.find({}).toArray();
}

export const createRoom = async (
    roomName, 
    balcony, 
    bedSizes, 
    pricingPerNight, 
    availability
  ) => {
    //checks for numRooms 
    if(!roomName) throw "You must provide the number of rooms";
    roomName = validation.checkString(roomName, "room name");
    
    //checks for balcony 
   // if(!balcony) throw "You must provide a value for balcony";
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

export const getRoomIdByNumber = async(num) => {
    if (typeof num !== 'number') throw "You must provide a number";
    let checkRoom = "Room " + num.toString();
    const roomCollection = await rooms();
    const room = await roomCollection.findOne({roomName: checkRoom})
    room._id = room._id.toString();
    return room._id
}

export const removeRoom = async(id) => {
    id = validation.checkId(id);
    const roomCollection = await rooms();
    const deletionInfo = await roomCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
  // if(!deletionInfo.value) throw `Room with ID ${id} does not exist.`;
    if (!deletionInfo) throw `Could not delete room with id of ${id}`;
    return {...deletionInfo, deleted: true};
};

export const updateRoom = async(id, roomName, balcony, bedSizes, pricingPerNight, availability) => {
    id = validation.checkId(id);
    //checks for numRooms 
    if(!roomName) throw "You must provide the number of rooms";
    roomName = validation.checkString(roomName, "room name");
        
    //checks for balcony 
    // if(!balcony) throw "You must provide a value for balcony";
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

    let updatedRoom = {
        roomName: roomName, //not really update-able
        balcony: balcony,  //not really update-able 
        bedSizes: bedSizes,
        pricingPerNight: pricingPerNight, 
        availability: availability
    } 

    const roomCollection = await rooms();
    const updateInfo = await roomCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: updatedRoom},
      {returnDocument: 'after'}
    );

    if (!updateInfo) throw 'Error: Update failed';
    return updateInfo;
    };
    
