document.getElementById('bookingForm').addEventListener('submit', (event)=>{
    event.preventDefault();
    const error = document.getElementById('error-message');
    error.style.display = 'none';

    const checkIn = document.getElementById('checkIn').value;

    if (!checkIn || !checkOut || !roomNumber || !guests || !guestInfo || !phone || !email) {
        error.style.display = 'block';
        error.textContent = 'Please fill out all required fields!';
        return;
      }
      const checkOut = document.getElementById('checkOut').value;
      const roomNumber = document.getElementById('roomType').value;
      const parking = document.getElementById('parking').checked;
      const guests = document.getElementById('guests').value;
      const guestInfo = document.getElementById('guestInfo').value.trim();

      //guest Info needed
      const guestFirstName = document.getElementById('guestFirstName').value.trim();
      const guestLastName = document.getElementById('guestLasttName').value.trim();
      const govId = document.getElementById('govId').value.trim();
      const age = document.getElementById('age').value;
      
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();

    const bookingDetails = {
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
        email,

    };
    console.log('Booking Details:', bookingDetails);

    const resultList = document.getElementById('bookingResults');
    const listItem = document.createElement('li');
    listItem.textContent = `Booking confirmed: ${JSON.stringify(bookingDetails)}`;
    resultList.appendChild(listItem);
  
    document.getElementById('bookingForm').reset();

})