
function checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
}

(function($) {
    document.getElementById("feedback-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const errors = [];

        let firstName = document.getElementById("firstName").value.trim();
        let lastName = document.getElementById("lastName").value.trim();
        let reservationId = document.getElementById("reservationID").value.trim();
        let feedback = document.getElementById("feedback").value.trim();
        let rating = document.getElementById("rating").value;
        rating = parseInt(rating, 10); 

        //firstName checks 
        try {
            firstName = checkString(firstName, "First Name")
            if (!firstName || firstName.length < 2 || firstName.length > 25 || /\d/.test(firstName)) {
                throw "First name must be between 2-25 characters, and cannot contain numbers or spaces.";
            }
        } catch(e) {
            errors.push(e)
        }

        //last name checks 
        try {
            lastName = checkString(lastName, "Last name");
            if (!lastName || lastName.length < 2 || lastName.length > 25 || /\d/.test(lastName)) {
                throw "Last name must be between 2-25 characters, and cannot contain numbers or spaces.";
            }
        } catch(e) {
            errors.push(e)
        }   

        //reservationId checks    
        try {
            reservationId = checkString(reservationId, "Reservation ID");
            if (!reservationId) {
                throw "Must provide a reservation ID.";
            }
        } catch(e) {
            errors.push(e)
        }

        //feedback checks 
        try {
            feedback = checkString(feedback, "Feedback");
            if (!feedback) {
                throw "Must provide feedback.";
            }
            if (feedback.length < 10) throw "Feedback must be longer than 10 characters"; 
            if (feedback.length > 300) throw "Please provide a shorter feedback. Must be shorter than 300 characters."
        } catch(e) {
            errors.push(e)
        }

        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            errors.push("Please select a valid rating between 1 and 5.");
        }

        if (errors.length > 0) {
            displayErrors(errors);
            return;
        }

        const feedbackData = {
            firstName,
            lastName,
            reservationId,
            feedback,
            rating
        };

        try {
            $.ajax({
                method: "POST",
                url: "/contact",
                contentType: "application/json",
                data: JSON.stringify(feedbackData),
                success: function(response) {
                    if (response.error) {
                        // If the response has an error, display it in the errors div
                        displayErrors([response.error]);
                    } else {
                        // Optionally, redirect or update the page on success
                        window.location.href = "/contact";
                    }
                },
                error: function(error) {
                    // If an error occurs, handle it
                    const errorMessage = error.responseJSON?.message || "Reservation ID is not valid. Please enter a valid reservation ID";
                    displayErrors([errorMessage]);
                }
            });
        } catch (error) {
            alert("An unexpected error occurred: " + error.message);
        }
    });

    function displayErrors(errors) {
        const errorContainer = document.getElementById("feedback-errors");
        errorContainer.innerHTML = ""; 
        errors.forEach((err) => {
            const errorElement = document.createElement("p");
            errorElement.className = "error";
            errorElement.textContent = err;
            errorContainer.appendChild(errorElement);
        });
    }
})(window.jQuery);


