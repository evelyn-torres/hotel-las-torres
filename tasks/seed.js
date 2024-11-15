import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import * as rooms from '../data/rooms.js';

const db = await dbConnection();
await db.dropDatabase();

let roomOne = undefined; 
let roomTwo = undefined; 
let roomThree = undefined; 
let roomFour = undefined; 
let roomFive = undefined; 
let roomSix = undefined; 
let roomSeven = undefined; 
let roomEight = undefined; 
let roomNine = undefined; 
let roomTen = undefined; 
let roomEleven = undefined; 

//adding room one
try {
    roomOne = await rooms.createRoom("Room 1", false, {"Double": 1, "Semi-Double": 1}, 120.00, {Monday: true});
} catch(e) {
    console.log(e)
}

//adding room two 
try {
    roomTwo = await rooms.createRoom("Room 2", false, {"Twin": 1, "Semi-Double": 3}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room three 
try {
    roomThree = await rooms.createRoom("Room 3", false, {"Double": 1, "Semi-Double": 2}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room four 
try {
    roomFour = await rooms.createRoom("Room 4", false, {"Double": 1}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room five 
try {
    roomFive = await rooms.createRoom("Room 5", false, {"Double": 1}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room six 
try {
    roomSix = await rooms.createRoom("Room 6", false, {"Double": 1, "Semi-Double": 1}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room seven 
try {
    roomSeven = await rooms.createRoom("Room 7", false, {"Double": 1, "Semi-Double": 2}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

console.log('Done seeding database');
await closeConnection();