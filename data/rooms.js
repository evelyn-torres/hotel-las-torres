import {rooms} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
//import { createAvailbyDates } from "../data/reservations.js"

/* populate set dates object for room availibility */
function createAvailbyDates(begin, end){
    let dates = {open:[], booked:[]};
    begin = new Date(begin).valueOf();
    end = new Date(end).valueOf();
    let curr = begin;
    while(curr < end){
        let temp = new Date(curr).toISOString().slice(0,10);
        dates.open.push(temp);
        curr += 86400000; //add a new day to current date for rooms
    }
    return dates;
};

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
    beginDate,
    endDate,
    imagePath

  ) => {
    //checks for numRooms 
    if(!roomName) throw "You must provide the number of rooms";
    roomName = validation.checkString(roomName, "room name");
    let roomCollection = await rooms();
    let allRooms = roomCollection.find({}).toArray();
    if (allRooms.length > 1){
        allRooms.forEach(room => {
            if (room.roomName){
                throw `Admin Error: ${roomName} already exists in database. Please provide a new room name to use`;
            }
        });
    }
    

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
    let todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0); // Reset today's date to midnight
    // beginDate - validation.checkString(beginDate, "begin date");
    // endDate - validation.checkString(endDate, "end date"); 

    beginDate = new Date(beginDate).toISOString();
    endDate = new Date(endDate).toISOString();
    console.log('before begin date validation', beginDate) 

    beginDate = validation.checkDate(beginDate, "begin date");
    endDate = validation.checkDate(endDate, "end date");
    let begin = new Date(beginDate);
    let end = new Date(endDate);

    //begin.setHours(0, 0, 0, 0); // Reset begin date to midnight
    //end.setHours(0, 0, 0, 0);   // Reset end date to midnight
    if (end.getTime() - begin.getTime() < 0) throw "Check-Out date must be after Check-In Date.";
    console.log(todaysDate.getTime());
    if (begin.getTime() < todaysDate.getTime()) throw "Cannot set room to open before today's date. Please select another date";
    const availability = createAvailbyDates(begin, end);
    if(!availability) throw "You must provide the availability for the room";
    if(typeof availability !== "object") throw "availability must be an object";

    //if (!imagePath || typeof imagePath !== "string") throw "You must provide a valid image path";

    let newRoom = {
        roomName: roomName, 
        balcony: balcony, 
        bedSizes: bedSizes, 
        pricingPerNight: pricingPerNight, 
        availability: availability,
        status: "ready",
        imagePath: imagePath
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

export const updateRoom = async(id, roomName, balcony, bedSizes, pricingPerNight) => {
    //checks for numRooms 
    if(!roomName) throw "You must provide the number of rooms";
    roomName = validation.checkString(roomName, "room name");
    // let roomColl = await rooms();
    // let allRooms = roomColl.find({}).toArray();
    // allRooms.forEach(room => {
    //     if (room.roomName){
    //         throw `Admin Error: ${roomName} already exists in database. Please provide a new room name to use`;
    //     }
    // });   make it so that form is unclickable

    //checks for balcony 
    // if(!balcony) throw "You must provide a value for balcony";
    if(typeof balcony !== "boolean") throw "Please indicate True or False for whether the room has a balcony or not.";
    
    //checks for bedSizes
    if(!bedSizes) throw "You must provide a value for bedSizes";
    if(typeof bedSizes !== "object") throw "You must provide bedSizes as an object";
    
    //checks for pricingPerNight 
    if(!pricingPerNight) throw "You mut provide a value for pricingPerNight"; 
    if(typeof pricingPerNight !== "number") throw "pricingPerNight must be a number";
    
    //checks for availability → will keep the availibilty the same, as there could be booking issues
    let currRoom = await getRoomById(id);
    //console.log("checking room", currRoom);
    let currentRoomAvail = currRoom.availability;
    if (!currentRoomAvail || typeof currentRoomAvail !== "object") throw "Admin Error: Can't fetch availibilty of current room";
    // let todaysDate = new Date();
    // beginDate - validation.checkString(beginDate, "begin date");
    // endDate - validation.checkString(endDate, "end date");
    // let begin = new Date(beginDate);
    // let end = new Date(endDate);
    // if (end.getTime() - begin.getTime() < 0) throw "Admin Error: Check-Out date must be after Check-In Date.";
    // if (begin.getTime() < todaysDate.getTime()) throw "Admin Error: Cannot set room to open before today's date. Please select another date";
    // const availability = createAvailbyDates(begin, end);
    // if(!availability) throw "You must provide the availability for the room";
    // if(typeof availability !== "object") throw "availability must be an object";

    let updatedRoom = {
        roomName: roomName, //not really update-able
        balcony: balcony, 
        bedSizes: bedSizes,
        pricingPerNight: pricingPerNight, 
        availability: currentRoomAvail //will keep the same and use another function to gray out completely
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
    
export const updateRoomStatus = async (id, newStatus) => {
    //id = validation.checkId(id, "room ID");
    const roomCollection = await rooms();
    const updatedInfo = await roomCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: newStatus } },
        { returnDocument: "after" }
    );
    if (!updatedInfo) throw "Failed to update room status";
    return updatedInfo;
};