import {Router} from 'express';
const router = Router();
import {roomData, reservationData} from '../data/index.js';
import { rooms } from '../config/mongoCollections.js';
import validation from '../helpers.js';
import multer from 'multer';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/pics/room_pics'));
  }
  ,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|heic/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Images must be in JPEG or PNG format.'));
        }
    }
});



router.route('/')
  .get(async (req, res) => {
    try {
      const roomList = await roomData.getAllRooms();
      roomList.forEach(room => {
        room._id = room._id.toString();
      });

      res.render('rooms', { 
        rooms: roomList, 
        pageTitle: "Rooms", 
        partial: 'rooms' 
      });
    } catch (e) {
      console.error("Error fetching rooms for page:", e);
      res.status(500).render('error', { message: 'Failed to load rooms', partial: 'dead_server_script' });
    }
  });

  router.route('/data')
  .get(async (req, res) => {
    try {
      const roomList = await roomData.getAllRooms();
      roomList.forEach(room => {
        room._id = room._id.toString();
      });
      res.json({ rooms: roomList });
    } catch (e) {
      console.error("Error fetching rooms JSON:", e);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });


    

router //after click on book now, route to room by roomid
    .route('/:roomId/bookingRoom')
    .get(async (req,res) => { 
      //console.log("params", req.params);
      const roomId = req.params.roomId;
      try{ //grab specifc room
        // console.log("get passed", roomId);
        let room = await roomData.getRoomById(roomId);
        res.render('roomBooking', {pageTitle: `Book ${room.roomName}`, hasErrors: false, partial:'rooms', roomId: roomId, roomName: room.roomName});

      } catch (e){ //can be used to make sure rooms are not avail after deleting
        console.log(e);
        // console.log("catch1");
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
    
         const roomCollection = await rooms();
          await roomCollection.updateOne(
            { _id: new ObjectId(roomId) },
            {
              $push: {
                "availability.booked": { checkIn, checkOut }
              }
            }
          );

        let resID = newBookingInfo._id
        let reservationCode = newBookingInfo.reservationCode;
        let roomName = await roomData.getRoomById(roomId).roomName;
        return res.status(201).render('roomBooking', {
          partial: 'rooms',
          success: true,
          successMessage: `Booking has been made! Your Reservation ID is ${reservationCode}. Thank you for choosing Hotel Las Torres for your stay.`,
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
          //  const {roomId} = req.params.roomId;
          console.log('Room ID:', roomId); // Debugging log
            const room = await roomData.getRoomById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }
            const reservations = await reservationsCollection
              .find({ roomId: roomId })   // ⚠️ note: must match your field name "roomID"
              .toArray();

            const booked = reservations.map(r => ({
              start: r.checkInDate,
              end: r.checkOutDate,
              title: `Reserved by ${r.guestFirstName} ${r.guestLastName}`,
              color: 'red'
            }));


            res.json({
                open: room.availability.open || [],
                booked
                 
            });
            //res.json(availability) IDK IF THIS should be 

        } catch (e) {
            console.log(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

  router
    .route('/:roomId')
    .delete(ensureAdmin, async (req, res) => {
     //const {roomId} = req.params;
    console.log('DELETE req received', req.params.roomId);
     try{

      const roomId = validation.checkId(req.params.roomId, "room ID");
      await roomData.removeRoom(roomId);
      // console.log('DA ROOM DATA:', roomData);

     res.redirect('/admin/dashboard');

      }catch(error){
        res.status(500).json({ error: error.message || 'Internal Server Error' })
      }
    });


    function ensureAdmin(req, res, next) {
      if (!req.session.user || req.session.user.toLowerCase() !== 'admin') {
          return res.status(403).render('error', {
              pageTitle: 'Access Denied',
              message: 'You do not have permission to perform this action.',
              partial: "dead_server_script"
          });
      }
      next();
  }

  router
    .route('/addRoomForm')
    .get(ensureAdmin, (req,res) =>{
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
  .post(ensureAdmin, upload.single('roomImage'), async (req, res)=>{
    let { roomName, pricingPerNight, balcony, bedSizes, beginDate, endDate } = req.body;
    let errors =[];
    try{
      const bedSizesArray = bedSizes.split(',').map(bed => bed.trim());
      for(let x in bedSizesArray) {
        if(bedSizesArray[x] !== "Double" && bedSizesArray[x] !== "Twin" && bedSizesArray[x] !== "Semi-Double") 
          throw "Bed type entries must be Double, Twin, or Semi-Double only"
      }
      const bedSizesObject = bedSizesArray.reduce((acc, bed) => {
        acc[bed] = (acc[bed] || 0) + 1;
        return acc;
    }, {});

      if (!roomName || !pricingPerNight || !bedSizesArray.length || !beginDate || !endDate) {
        throw 'Missing required fields.';
      }
    const availability = {
      open: true,
      booked: false,
  };
    roomName = validation.checkString(roomName, "Room Name");
    const roomCollection = await rooms();
            const room = await roomCollection.findOne({roomName: roomName});

            if (room) {
                console.log("Duplicate room name:", room.roomName);
                throw "Room name already exists";
            }
    pricingPerNight = parseInt(pricingPerNight, 10);
    if(typeof pricingPerNight !== "number") throw "Price must be a number";
    if(pricingPerNight < 25) throw "Price is too low. Please set it higher than 25";
    if(pricingPerNight > 1000) throw "Price is too high. Please set it lower than 1000.";
    



  const hasBalcony = balcony === 'true';
  const parsedPricing = parseFloat(pricingPerNight);
    
  const imagePath = req.file ? `/pics/room_pics/${req.file.filename}` : null;

  const newRoom = await roomData.createRoom(
      roomName,
      hasBalcony,
      bedSizesObject,
      parsedPricing,
      beginDate,
      endDate,
      imagePath
      
    );

  const roomList = await roomData.getAllRooms();

    res.redirect('/admin/dashboard');
    res.render('addRoom', 
      {rooms: roomList, 
        partial: 'addRoomForm',
        success: true,
        successMessage: `Room "${newRoom.roomName}" has been added successfully!`,});
       res.redirect('/admin/dashboard');



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
  });
  

export default router;