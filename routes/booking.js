import express from "express";
const router = express.Router();
import { roomData, reservationData } from "../data/index.js";


router.route('/').get(async (req, res) => {
  try {
      res.render('booking', { partial: 'booking_script' }); 
  } catch (error) {
      res.status(500).json({ error: 'Error displaying booking form' });
  }
})
.post(async (req,res) => {
  try {
    const newBookingData = req.body;

    let checkIn = newBookingData.checkIn; 
    let checkOut = newBookingData.checkOut; 
    let roomNumber = parseInt(newBookingData.roomNumber);
    let roomID = await roomData.getRoomIdByNumber(roomNumber) //getRoomID
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
    let age = parseInt(newBookingData.age); 
    let phone = newBookingData.phone; 
    let email = newBookingData.email;  
    let totalcost = 0; //setting this as 0 for now 

    let newBookingInfo = await reservationData.createReservation(guestFirstName, guestLastName, govID, age, phone,
      email, numOfGuests, roomID, checkIn, checkOut, parking, totalcost) 
    if (!newBookingInfo) throw `Error could not create new list`;

    return res.status(201).json({success: true, data: newBookingInfo})

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;