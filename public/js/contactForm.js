
let contactForm = document.getElementById('feedback-form');
let resID = document.getElementById('reservationID').value
let feedback = document.getElementById('feedback-input')

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Form Submission Fired")

    console.log(resID)

    contactForm.reset()

})