import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import * as rooms from '../data/rooms.js';

const db = await dbConnection();
await db.dropDatabase();

let roomOne = undefined; 

try {
    roomOne = await rooms.createRoom(2, true, {king: 2}, 120.00, {Monday: true});
} catch(e) {
    console.log(e)
}

console.log('Done seeding database');
await closeConnection();