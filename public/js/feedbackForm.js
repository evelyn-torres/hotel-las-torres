document.getElementById("feedback-form").addEventListener("submit", async (event) =>{
    event.preventDefault();

    const errors=[];

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const reservationId = document.getElementById('reservationID').value.trim();
    const feedback = document.getElementById('feedback').value.trim();
    const rating = document.getElementById("rating").value;


    if (!firstName || typeof firstName !== 'string' || firstName.length < 2 || firstName.length > 25 || /\d/.test(firstName)) {
        errors.push("First name must be between 2-25 characters, and cannot contain numbers or spaces.");
    }

    if (!lastName || typeof lastName !== 'string' || lastName.length < 2 || lastName.length > 25 || /\d/.test(lastName)) {
        errors.push("Last name must be between 2-25 characters, and cannot contain numbers or spaces.");
    }

    if (!reservationId){
        errors.push('Must provide a valid reservation ID');
    }

    if(!feedback){
        errors.push('Must provide feedback');
    }

    if(!rating ||  isNaN(rating)){
        errors.push("Please select a rating.");
    }

    if(errors.length > 0){
        console.log(errors);
        displayErrors(errors);
        return; 
    }
    try{
        const response = await axios.post("/contact", {
                firstName,
                lastName,
                reservationID: reservationId,
                feedback,
                rating,
            
        })
       // let comments = response.data.comments;

       if (response.status === 201) {
        // Display updated comments if the form submission is successful
        const comments = response.data.comments || [];
        displayComments(comments);

        // Reset the form
        document.getElementById("feedback-form").reset();
        clearErrors();
        displaySuccess(response.data.successMessage || "Feedback submitted successfully!");
    }
} catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
        displayErrors([error.response.data.error]);
    } else {
        displayErrors(["An unexpected error occurred. Please try again later."]);
    }
}

      function displayErrors(errors) {
        let errorDiv = document.querySelector(".error") || document.createElement("div");
        errorDiv.className = "error";
        errorDiv.innerHTML = errors.map(err => `<p>${err}</p>`).join("");
        document.getElementById("feedback-form").prepend(errorDiv);
    }

    function clearErrors() {
        const errorDiv = document.querySelector(".error");
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function displaySuccess(message) {
        let successDiv = document.querySelector(".success") || document.createElement("div");
        successDiv.className = "success";
        successDiv.innerHTML = `<p>${message}</p>`;
        document.getElementById("feedback-form").prepend(successDiv);

        setTimeout(() => {
            if (successDiv) successDiv.remove();
        }, 5000);
    }

    function displayComments(comments) {
        const commentsSection = document.getElementById("comments-section");
        if (commentsSection) {
            commentsSection.innerHTML = comments.map(comment =>
                `<div class="comment">
                    <p><strong>${comment.firstName} ${comment.lastName}</strong></p>
                    <p>${comment.feedback}</p>
                    <p>Rating: ${comment.rating}</p>
                </div>`
            ).join("");
        }
    }
});





















