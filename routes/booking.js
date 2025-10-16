import express from "express";
const router = express.Router();
import { roomData, reservationData } from "../data/index.js";
import xss from 'xss';

router.route('/').get(async (req, res) => {
  try {
      res.render('booking', { partial: 'booking_script' }); 
  } catch (error) {
      res.status(500).json({ error: 'Error displaying booking form' });
  }
})
.post(async (req,res) => {
  const newBookingData = req.body;
  console.log("booking_data", newBookingData);
  let errors = [];
  try {
    let checkIn = newBookingData.checkIn; 
    let checkOut = newBookingData.checkOut; 
    // let roomNumber = parseInt(newBookingData.roomNumber);
    // let roomID = await roomData.getRoomIdByNumber(roomNumber) //getRoomID
    let parking = newBookingData.parking;
    if (parking === 'on') {
      parking = true; 
    }
    else {
      parking = false; 
    }


    let numOfGuests = parseInt(xss(newBookingData.numOfGuests));
    // let guestFirstName = xss(newBookingData.guestFirstName);
    // let guestLastName = xss(newBookingData.guestLastName); 
    // let govID = xss(newBookingData.govID);
    // let age = xss(newBookingData.age); 
        const guestFirstNames = Array.isArray(newBookingData.guestFirstName)
      ? newBookingData.guestFirstName.map(name => xss(name))
      : [xss(newBookingData.guestFirstName)];

    const guestLastNames = Array.isArray(newBookingData.guestLastName)
      ? newBookingData.guestLastName.map(name => xss(name))
      : [xss(newBookingData.guestLastName)];

    const govIDs = Array.isArray(newBookingData.govID)
      ? newBookingData.govID.map(id => xss(id))
      : [xss(newBookingData.govID)];

    const ages = Array.isArray(newBookingData.age)
      ? newBookingData.age.map(a => xss(a))
      : [xss(newBookingData.age)];
    let phone = xss(newBookingData.phone); 
    let email = xss(newBookingData.email);  
    let totalcost = 0; //setting this as 0 for now 

    let reservations = [];
    for (let i = 0; i<numOfGuests; i++){
      let newBookingInfo = await reservationData.createReservation(
        guestFirstNames[i] || '', 
        guestLastNames[i] || '', 
        govIDs[i] || '', 
        ages[i] || '', 
        phone,
      email, 
      numOfGuests,
       newBookingData.roomId, 
       checkIn, 
       checkOut,
        parking) ;
        reservations.push(newBookingInfo)

    }

    
    if (!newBookingInfo) throw `Internal Error(R): could not create new booking`;
    const lastBooking = reservations[reservations.length - 1];
    let resID = newBookingInfo._id
    let reservationCode = lastBooking.reservationCode;
    
    return res.status(201).render('roomBooking', {
      partial: 'rooms',
      success: true,
      successMessage: `Booking has been made! Your Reservation ID is ${reservationCode}. Thank you for choosing Hotel Las Torres for your stay.`,
      resID: resID
  });

  } catch (e) {
    console.error(e);
    errors.push(e);
  }

  if (errors.length > 0){
    return res.render("roomBooking", {hasErrors: true, errors: errors, partial: "rooms"});
 }
});

export default router;