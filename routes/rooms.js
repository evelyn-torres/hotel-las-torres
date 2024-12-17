import {Router} from 'express';
const router = Router();
import {roomData, reservationData} from '../data/index.js';
import { rooms } from '../config/mongoCollections.js';
import validation from '../helpers.js';



router //show all rooms
    .route('/')
    .get(async (req, res) => {
        try {
          const roomList = await roomData.getAllRooms();
          roomList.forEach(room => {
            //console.log("testing", roomSel);
            room._id = room._id.toString();
          });
          console.log(roomList);
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
        return res.render("roomBooking", 
          {pageTitle: `Book ${roomName}`, 
          hasErrors: true, errors: errors, 
          partial: "rooms", 
          roomId: roomId, 
          roomName: roomName});
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

  router
    .route('/:roomId')
    .delete(async (req, res) => {
     // const {roomId} = req.params;
     console.log('DELETE req received', req.params.roomId);
     try{

      const roomId = validation.checkId(req.params.roomId, "room ID");
      await roomData.removeRoom(roomId);
      console.log('DA ROOM DATA:', roomData);

       // await roomData.removeRoom(roomId);
     //  res.status(200).json({ success: true, messsage: 'Room deleted successfully' });
     //res.status(200).json({ success: true, message: 'Room deleted successfully' });;
     res.redirect('/admin/dashboard');

      }catch(error){
        res.status(500).json({ error: error.message || 'Internal Server Error' })
      }
    });

  router
    .route('/addRoomForm')
    .get((req,res) =>{
      try{
        res.render('addRoom', {
           pageTitle: 'Add New Room',
           hasErrors: false,
           partial: 'addRoomForm'
       })
      }catch(e){
      console.error(e);
      res.status(500).json({error: 'Internal Server Error'})
  }
    })
  .post(async (req, res)=>{
    const { roomName, pricingPerNight, balcony, bedSizes } = req.body;
    let errors =[];
    try{
      const bedSizesArray = bedSizes.split(',').map(bed => bed.trim());
      if (!roomName || !pricingPerNight || !bedSizesArray.length) {
        throw ('Missing required fields.');
    }
    const availability = {
      open: true,
      booked: false,
  };
  // const balcony ={
  //   Yes: true,
  //   No: false
  // }
  const hasBalcony = balcony === 'true';

  console.log('in create room:', req.body)
      
      const newRoom = await roomData.createRoom(
        roomName,
        hasBalcony,
        bedSizesArray,
        parseFloat(pricingPerNight),
        availability);

      res.render('addRoom', 
        {rooms: roomList, 
          pageTitle: "Rooms", 
          partial: 'addRoomForm',
          success: true,
          successMessage: `Room "${newRoom.roomName}" has been added successfully!`,});



    }catch(e){
      console.error(e);
      errors.push(e);
      res.status(400).render('addRoom', {
        pageTitle: 'Add a New Room',
        hasErrors: true,
        errors: errors,
        partial: 'addRoomForm',
      });
    }
  })

export default router;