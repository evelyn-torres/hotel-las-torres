import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import * as rooms from '../data/rooms.js';
import * as guests from '../data/guests.js'
import * as reservations from '../data/reservations.js';
import * as comments from '../data/comments.js';
import * as admin from '../data/admin.js';

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
let guestTwo = undefined; 
let reservationOne = undefined; 
let commentOne = undefined; 
let dates = {open:[], booked:[]};

/* populate set dates object for room availibility */
function createAvailbyDates(begin, end){
    begin = new Date(begin).valueOf();
    end = new Date(end).valueOf();
    let curr = begin;
    while(curr < end){
        let temp = new Date(curr).toISOString().slice(0,10);
        dates.open.push(temp);
        curr += 86400000; //add a new day to current date for rooms
    }
};
createAvailbyDates("2025-01-02", "2025-02-02"); /* CAN CHANGE BASED ON YEAR -→ will use only 2025 for project*/

//adding room one
try {
    roomOne = await rooms.createRoom("Room 1", false, {"Double": 1, "Semi-Double": 1}, 120.00, dates);
} catch(e) {
    console.log(e)
}

//adding room two 
try {
    roomTwo = await rooms.createRoom("Room 2", false, {"Twin": 1, "Semi-Double": 3}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room three 
try {
    roomThree = await rooms.createRoom("Room 3", false, {"Double": 1, "Semi-Double": 2}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room four 
try {
    roomFour = await rooms.createRoom("Room 4", false, {"Double": 1}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room five 
try {
    roomFive = await rooms.createRoom("Room 5", false, {"Double": 1}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room six 
try {
    roomSix = await rooms.createRoom("Room 6", false, {"Double": 1, "Semi-Double": 1}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room seven 
try {
    roomSeven = await rooms.createRoom("Room 7", false, {"Double": 1, "Semi-Double": 2}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room eight
try {
    roomEight = await rooms.createRoom("Room 8", false, {"Double": 2}, 100.00, dates)
    console.log(roomEight)
} catch(e) {
    console.log(e)
}

//adding room nine
try {
    roomNine = await rooms.createRoom("Room 9", false, {"Double": 1, "Semi-Double": 2}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room ten
try {
    roomTen = await rooms.createRoom("Room 10", false, {"Twin": 1, "Semi-Double": 2}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding room eleven
try {
    roomEleven = await rooms.createRoom("Room 11", false, {"Double": 3}, 100.00, dates)
} catch(e) {
    console.log(e)
}

//adding a guest
try {
    guestOne = await guests.createGuest("John", "Doe", 24, "A24294820", 9144093842, "john.doe@gmail.com");
    console.log(guestOne)
} catch(e) {
    console.log(e)
}

//adding another guest 
try {
    guestTwo = await guests.createGuest("Harry", "Potter", 16, "83J91938", 20184983921, "hp@gryffindor.com");
} catch(e) {
    console.log(e)
}

//adding a reservation 
// try {
//     reservationOne = await reservations.createReservation([guestOne._id.toString(), guestTwo._id.toString()], 3, roomEight._id.toString(), new Date('November 15, 2024'), 
//     new Date('November 18, 2023'), true, true, 600.00)
//     console.log(reservationOne)
// } catch(e) {
//     console.log(e)
// }

//testing for getroomIDbynumber
try {
    let roomtest = await rooms.getRoomIdByNumber(5);
} catch (e) {
    console.log(e)
}

//adding an employee
console.log('Adding a new employee/admin to databse:');
try{
    const admin1 = await admin.createAdmin("Jane", "Dane", "A24294821" ,"adminUser1", "adminPassword1");
    console.log(admin1)
}catch(e){
    console.log(e);
}

//adding another employee
console.log('Adding a new employee/admin to databse2:');
try{
    const admin2 = await admin.createAdmin("Wes", "Nabo", "WN167059" ,"wnabo", "nabo_password1");
    console.log(admin2)
}catch(e){
    console.log(e);
}


console.log('Done seeding database');
await closeConnection();