//other functions here if necessary


document.getElementById('bookingForm').addEventListener('submit', (event)=>{
    event.preventDefault();

    let error = document.getElementById('error');
    error.style.display = 'none';

    let checkIn = document.getElementById('checkIn').value;
    let checkOut = document.getElementById('checkOut').value;
    let roomNumber = document.getElementById('roomNumber').value;
    let parking = document.getElementById('parking').checked;
    let guests = document.getElementById('guests').value;
    let guestFirstName = document.getElementById('guestFirstName').value.trim();
    let guestLastName = document.getElementById('guestLastName').value.trim();
    let govId = document.getElementById('govId').value.trim();
    let age = document.getElementById('age').value;
    let phone = document.getElementById('phone').value.trim();
    let email = document.getElementById('email').value.trim();

      
    // console.log(checkIn)
    // if (!checkIn || !checkOut || !roomNumber || !guests || !guestFirstName || !guestLastName || !age || !govId || !phone || !email) {
    //     error.style.display = 'block';
    //     error.textContent = 'Please fill out all required fields!';
    //     return;
    // }

    let bookingDetails = {
        checkIn,
        checkOut,
        roomNumber,
        parking,
        guests,
        guestFirstName,
        guestLastName,
        govId,
        age, 
        phone,
        email
    };

    console.log('Booking Details:', bookingDetails);

    let resultList = document.getElementById('newBooking');
    let listItem = document.createElement('li');

    console.log(listItem)
    listItem.textContent = `Booking confirmed: ${JSON.stringify(bookingDetails)}`;
    resultList.appendChild(listItem);
  
    document.getElementById('bookingForm').reset();
})