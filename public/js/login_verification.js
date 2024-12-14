document.addEventListener("DOMContentLoaded", function () {   
    document.getElementById('loginForm').addEventListener("submit", function(event) {
    try {
         const err = [];
 
         // Get form fields
         const username = document.getElementById("userInput").value.trim();
         const password = document.getElementById("passInput").value.trim();
 
        // Remove existing error divs (if any)
         const existingErrorDiv = document.querySelector(".error-container");
         if (existingErrorDiv) existingErrorDiv.remove();
 
         // Validate username
         if (!username) {
             err.push("Please enter your username.");
         }
         if (typeof username !== 'string' || username.trim().length === 0) {
             err.push('Please enter a valid username.');
         }
         console.log(err);
 
         // Validate password
         if (!password) {
             err.push('Please enter your password.');
         }
         if (password.trim().length === 0) {
             err.push('Please enter a valid password.');
         }
 
                // If there are errors, prevent form submission and display errors
                if (err.length > 0) {
                    event.preventDefault(); // Prevent form submission
                    const errorDiv = document.createElement("div");
                    errorDiv.className = "error-container";
                    
                    const errorList = document.createElement("ul");
                    err.forEach(e => {
                        const listItem = document.createElement("li");
                        listItem.textContent = e;
                        console.log(listItem);
                        errorList.appendChild(listItem);
                    });
        
                    errorDiv.appendChild(errorList);
                    document.getElementById('loginForm').prepend(errorDiv); // Display errors above the form
                } else {
                    console.log("Form submitted successfully."); // Debug log
                }
            } catch (error) {
                console.error("An error occurred during form validation:", error);
            }
        })});
        