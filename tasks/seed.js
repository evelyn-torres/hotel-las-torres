import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import * as rooms from '../data/rooms.js';
import * as guests from '../data/guests.js'
import * as reservations from '../data/reservations.js';
import * as comments from '../data/comments.js';

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
let guestOne = undefined; 
let reservationOne = undefined; 
let commentOne = undefined; 

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

//adding room eight
try {
    roomEight = await rooms.createRoom("Room 8", false, {"Double": 2}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room nine
try {
    roomNine = await rooms.createRoom("Room 9", false, {"Double": 1, "Semi-Double": 2}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room ten
try {
    roomTen = await rooms.createRoom("Room 10", false, {"Twin": 1, "Semi-Double": 2}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding room eleven
try {
    roomEleven = await rooms.createRoom("Room 11", false, {"Double": 3}, 100.00, {Tuesday: true})
} catch(e) {
    console.log(e)
}

//adding a guest
try {
    guestOne = await guests.createGuest("John", "Doe", 24, "A24294820", 9144093842, "john.doe@gmail.com");
} catch(e) {
    console.log(e)
}

//adding a reservation 
try {
    reservationOne = await reservations.createReservation([guestOne._id.toString()], 3, roomEight._id.toString(), new Date('November 15, 2024'), 
    new Date('November 18, 2023'), true, true, 600.00)
} catch(e) {
    console.log(e)
}

//adding a comment 
try {
    commentOne = await comments.createComment(guestOne._id.toString(), roomOne._id.toString(), reservationOne._id.toString(), 
    "I had a wonderful stay at Hotel Las Torres", 5)
    console.log(commentOne)
} catch(e) {
    console.log(e)
}

console.log('Done seeding database');
await closeConnection();