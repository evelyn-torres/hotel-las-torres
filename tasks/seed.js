import dotenv from 'dotenv';
dotenv.config();

import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import * as rooms from '../data/rooms.js';
import * as guests from '../data/guests.js';
import * as reservations from '../data/reservations.js';
import * as comments from '../data/comments.js';
import * as admin from '../data/admin.js';
//import * as roomPics from '../public/pics/room_pics'


const db = await dbConnection();
await db.dropDatabase();

let roomOne, roomTwo, roomThree, roomFour, roomFive;
let roomSix, roomSeven, roomEight, roomNine, roomTen, roomEleven;
let guestOne, guestTwo, reservationOne;

// Get today's date and calculate a future date for `closeDate`
const today = new Date();
//Date = today.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
const openDate = new Date(today);

const futureDate = new Date(today);
futureDate.setDate(today.getDate() + 30); // Set closeDate 30 days from today
const closeDate = new Date(today);
//const closeDate = futureDate.toISOString().split('T')[0];
closeDate.setDate(closeDate.getDate() + 30); // Set closeDate 30 days from today
console.log('Adding rooms:');
try {
  roomOne = await rooms.createRoom("Room 1", false, { "Double": 1, "Semi-Double": 1 }, 120.00, openDate, closeDate);
  console.log(roomOne);
} catch (e) {
  console.error(e);
}

try {
  roomTwo = await rooms.createRoom("Room 2", false, { "Twin": 1, "Semi-Double": 3 }, 100.00, openDate, closeDate);
  console.log(roomTwo);
} catch (e) {
  console.error(e);
}

try {
  roomThree = await rooms.createRoom("Room 3", false, { "Double": 1, "Semi-Double": 2 }, 100.00, openDate, closeDate);
  console.log(roomThree);
} catch (e) {
  console.error(e);
}

try {
  roomFour = await rooms.createRoom("Room 4", false, { "Double": 1 }, 100.00, openDate, closeDate);
  console.log(roomFour);
} catch (e) {
  console.error(e);
}

try {
  roomFive = await rooms.createRoom("Room 5", false, { "Double": 1 }, 100.00, openDate, closeDate, "pics/room_pics/room5.jpg");
  console.log(roomFive);
} catch (e) {
  console.error(e);
}

try {
  roomSix = await rooms.createRoom("Room 6", false, { "Double": 1, "Semi-Double": 1 }, 100.00, openDate, closeDate);
  console.log(roomSix);
} catch (e) {
  console.error(e);
}

try {
  roomSeven = await rooms.createRoom("Room 7", false, { "Double": 1, "Semi-Double": 2 }, 100.00, openDate, closeDate);
  console.log(roomSeven);
} catch (e) {
  console.error(e);
}

try {
  roomEight = await rooms.createRoom("Room 8", false, { "Double": 2 }, 100.00, openDate, closeDate);
  console.log(roomEight);
} catch (e) {
  console.error(e);
}

try {
  roomNine = await rooms.createRoom("Room 9", false, { "Double": 1, "Semi-Double": 2 }, 100.00, openDate, closeDate);
  console.log(roomNine);
} catch (e) {
  console.error(e);
}

try {
  roomTen = await rooms.createRoom("Room 10", false, { "Twin": 1, "Semi-Double": 2 }, 100.00, openDate, closeDate);
  console.log(roomTen);
} catch (e) {
  console.error(e);
}

try {
  roomEleven = await rooms.createRoom("Room 11", false, { "Double": 3 }, 100.00, openDate, closeDate);
  console.log(roomEleven);
} catch (e) {
  console.error(e);
}

console.log('Adding guests:');
try {
  guestOne = await guests.createGuest("John", "Doe", 24, "A24294820", 9144093842, "john.doe@gmail.com");
  console.log(guestOne);
} catch (e) {
  console.error(e);
}

try {
  guestTwo = await guests.createGuest("Harry", "Potter", 16, "83J91938", 20184983921, "hp@gryffindor.com");
  console.log(guestTwo);
} catch (e) {
  console.error(e);
}

console.log('Adding reservations:');
try {
  reservationOne = await reservations.createReservation(
    [guestOne._id.toString(), guestTwo._id.toString()],
    3,
    roomEight._id.toString(),
    new Date(today), // Reservation start date as today
    new Date(futureDate), // Reservation end date 30 days from today
    true,
    true,
    600.00
  );
  console.log(reservationOne);
} catch (e) {
  console.error(e);
}

console.log('Adding admins:');
try {
  const admin1 = await admin.createAdmin("Jane", "Dane", "A24294821", "adminUser1", "adminPassword1");
  console.log(admin1);
} catch (e) {
  console.error(e);
}

try {
  const admin2 = await admin.createAdmin("Wes", "Nabo", "WN167059", "wnabo", "nabo_password1");
  console.log(admin2);
} catch (e) {
  console.error(e);
}

// try{
//   const edit5 = await rooms.updateRoom(
//     "roomFive._id",
//     "Room 5",
//     true,
//     {double: 2},
//     150,
//     "pics/room_pics/room5.jpg"
//   )
//     console.log('try to add img to room 5');
// }catch(e){
//   console.error(e);
// }

console.log('Done seeding database');
await closeConnection();