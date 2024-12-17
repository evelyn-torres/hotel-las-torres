
// document.getElementById('createAdminForm').addEventListener('submit', function (event) {
//     event.preventDefault();
//     //let errordiv = document.getElementById('error_div'); 
//     // prevent submission 

//     let employeeFirstName = document.getElementById('employeeFirstName').value;
//     let employeeLastName = document.getElementById('employeeLastName').value; 
//     let govID = document.getElementById('govID').value; 
//     let username = document.getElementById('userName').value;
//     let password = document.getElementById('password').value;
//     let confirmPassword = document.getElementById('confirmPassword').value; 

//     try {
//         const response = await fetch('/admin/dashboard/createAdmin', {
//             method: 'POST', 
//             headers: {'Content-Type': 'application/json'}, 
//             body: JSON.stringify(formObject)
//         }};

//         })
// //this doesn't work yet 

// document.getElementById('createAdminForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent default form submission

//     const formData = new FormData(this);
//     console.log(formData)
//     const formObject = Object.fromEntries(formData.entries());

//     try {
//         const response = await fetch('/admin/dashboard/createAdmin', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(formObject),
//         });

//         if (response.ok) {
//             window.location.href = '/admin/dashboard/createAdmin';
//         } else {
//             const error = await response.json();
//             console.error('Error:', error);
//         }
//     } catch (err) {
//         console.error('Fetch error:', err);
//     }
// });