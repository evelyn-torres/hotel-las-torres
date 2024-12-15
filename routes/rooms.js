import {Router} from 'express';
const router = Router();
import {roomData, reservationData} from '../data/index.js';
import { rooms } from '../config/mongoCollections.js';


router //show all rooms
    .route('/')
    .get(async (req, res) => {
        try {
          const roomList = await roomData.getAllRooms();
          roomList.forEach(room => {
            //console.log("testing", roomSel);
            room._id = room._id.toString();
          });
          //console.log(roomList);
          res.render('rooms', {rooms: roomList, pageTitle: "Rooms", partial: 'rooms'});
        } catch (e) {
          res.status(500).json({error: e});
        }
    });

router //after click on book now, route to room by roomid
    .route('/:roomId/bookingRoom')
    .get(async (req,res) => { 
      //console.log("params", req.params);
      const roomId = req.params.roomId;
      try{ //grab specifc room
        console.log("get passed", roomId);
        let room = await roomData.getRoomById(roomId);
        res.render('roomBooking', {pageTitle: `Book ${room.roomName}`, hasErrors: false, partial:'rooms', roomId: roomId, roomName: room.roomName});

      } catch (e){ //can be used to make sure rooms are not avail after deleting
        console.log(e);
        console.log("catch1");
        let roomName = "undo2";
        let room = await roomData.getRoomById(roomId);
        if (room && room !== undefined){
          roomName = room.roomName;
        }
        return res.render('roomBooking', {pageTitle: `Book ${roomName}`, hasError: true, errors: e, partial: "rooms", roomId: roomId, roomName: roomName});
      }
    })
    .post(async (req,res) => { //after clicking submit on booking room, making booking and check avail
      const roomId = req.params.roomId;
      const newBookingData = req.body;
      console.log("data from room", newBookingData);

      let errors = [];
      try {
        let checkIn = newBookingData.checkIn; 
        let checkOut = newBookingData.checkOut; 
        let parking = newBookingData.parking;
        if (parking === 'on') {
          parking = true; 
        }
        else {
          parking = false; 
        }
        let numOfGuests = parseInt(newBookingData.numOfGuests);
        let guestFirstName = newBookingData.guestFirstName;
        let guestLastName = newBookingData.guestLastName; 
        let govID = newBookingData.govID;
        let age = newBookingData.age; 
        let phone = newBookingData.phone; 
        let email = newBookingData.email;  
        let totalcost = 0; //setting this as 0 for now 
    
        let newBookingInfo = await reservationData.createReservation(guestFirstName, guestLastName, govID, age, phone,
          email, numOfGuests, roomId, checkIn, checkOut, parking, totalcost) 
        if (!newBookingInfo) throw `Internal Error(R): could not create new booking`;
    
        let resID = newBookingInfo._id
        
        let roomName = await roomData.getRoomById(roomId).roomName;
        return res.status(201).render('roomBooking', {
          partial: 'rooms',
          success: true,
          successMessage: `Booking has been made! Your Reservation ID is ${resID}. Thank you for choosing Hotel Las Torres for your stay.`,
          resID: resID,
          roomId: roomId,
          roomName: roomName
      });
    
      } catch (e) {
        console.log("res", e);
        errors.push(e);
      }
    
      if (errors.length > 0){
        //console.log(errors);
        let roomName = "Redo";
        let room = await roomData.getRoomById(roomId);
        if (roomName && room !== undefined){
          roomName = room.roomName;
        }
        return res.render("roomBooking", {pageTitle: `Book ${roomName}`, hasErrors: true, errors: errors, partial: "rooms", roomId: roomId, roomName: roomName});
     }
    });    

router
    .route('/:roomId/availability')
    .get(async (req, res) => {
      let { roomId } = req.params;
        try {
            //const {roomId} = req.params.roomId;
            //console.log('Room ID:', roomId); // Debugging log
            const room = await roomData.getRoomById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }

            res.json({
                open: room.availability.open,
                booked: room.availability.booked,
            });

        } catch (e) {
            console.log(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

export default router;