let contactForm = document.getElementById('feedback-form');

contactForm.addEventListener('submit', (event) => {

    event.preventDefault();
    console.log("Form Submission Fired")
})