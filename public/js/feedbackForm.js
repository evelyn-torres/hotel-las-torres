
// //do input validation here!!! this is client-side 
// uncomment this when we learn ajax 

// const checkString = (strVal, varName) => {
//     if (!strVal) throw `Error: You must supply a ${varName}!`;
//     if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
//     strVal = strVal.trim();
//     if (strVal.length === 0)
//       throw `Error: ${varName} cannot be an empty string or string with just spaces`;
//     if (!isNaN(strVal))
//       throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
//     return strVal;
//   }

// let feedbackForm = document.getElementById('feedback-form')

// feedbackForm.addEventListener('submit', (event) => {
//   event.preventDefault()
//   let firstName = document.getElementById('firstName').value
//   let lastName = document.getElementById('lastName').value
//   let reservationID = document.getElementById('reservationID').value
//   let feedback = document.getElementById('feedback').value
//   let rating = parseInt(document.getElementById('rating').value)
  
//   console.log(firstName)
//   console.log(lastName)
//   console.log(rating)
//   feedbackForm.reset()

// })