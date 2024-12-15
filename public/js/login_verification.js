// //client-side verification

import axios from 'axios';

// document.addEventListener("DOMContentLoaded", function () {   
document.getElementById('loginForm').addEventListener("submit", async (event) => {
    event.preventDefault();
    const errors = [];

        // Get form fields
        const username = document.getElementById("userInput").value.trim();
        const password = document.getElementById("passInput").value.trim();

        // Validate username
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            errors.push("Please enter your username.");
        }
        // if (typeof username !== 'string' || username.trim().length === 0) {
        //     errors.push('Please enter a valid username.');
        // }
        console.log(errors);

         // Validate password
         if (!password || password.trim().length === 0) {
             errors.push('Please enter your password.');
         }
        //  if (password.trim().length === 0) {
        //      errors.push('Please enter a valid password.');
        //  }

 
                // If there are errors, prevent form submission and display errors
        if (errors.length > 0) {
            console.log(errors);
            displayErrors(errors);
            return;
        }
        try{
            const response = await axios.post("/login",{
                userInput: username,
                passInput: password,
            } )
            if(response.status === 200 ){
                window.location.href ='/admin/dashboard' ;
                document.getElementById("loginForm").reset();
                clearErrors();
            } else{
                console.log("hiiiii");
                const errorData = await response.json();
                displayErrors(errors);
              //  document.getElementById('message').innerHTML = `<div class="error">${errorData.error}</div>`;
                document.getElementById("loginForm").reset();
            }

          //  clearErrors();
        }catch(error){
            if (error.response && error.response.data && error.response.data.error) {
                displayErrors([error.response.data.error]);
            } else {
                console.log('heyoo');
                displayErrors(["An unexpected error occurred. Please try again later."]);
                document.getElementById("loginForm").reset();
            }
        }
        function displayErrors(errors) {
            let errorDiv = document.querySelector(".error") || document.createElement("div");
            errorDiv.className = "error";
            errorDiv.innerHTML = errors.map(err => `<p>${err}</p>`).join("");
            document.getElementById("loginForm").prepend(errorDiv);
            document.getElementById("loginForm").reset();
        }
    
        function clearErrors() {
            const errorDiv = document.querySelector(".error");
            if (errorDiv) {
                errorDiv.remove();
            }
        }

    });

                    

//             } catch (error) {
//                 console.error("An error occurred during form validation:", error);
//             }
//         })});
        


