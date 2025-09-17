// import sgMail from '@sendgrid/mail';

// sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

// export const sendEmailConfirmation = async (toEmail, reservation) => {
//     const { guestFirstName, guestLastName, checkInDate, checkOutDate, reservationCode, totalCost } = reservation;
//     const msg = {
//         to: toEmail,
//         from: 'hotellastorres2006@hotmail.com', // Verified sender email
//         //password: Quimbaya2006
//         subject: 'Hotel Reservation Confirmation',
//         html: `
//             <h1>Hotel Las Torres - Reservation Confirmation</h1>
//             <p>Dear ${guestFirstName} ${guestLastName},</p>
//             <p>Thank you for booking your stay at Hotel Las Torres. Below are the details of your reservation:</p>
//             <ul>
//                 <li><strong>Reservation Code:</strong> ${reservationCode}</li>
//                 <li><strong>Check-In Date:</strong> ${checkInDate}</li>
//                 <li><strong>Check-Out Date:</strong> ${checkOutDate}</li>
//                 <li><strong>Total Cost:</strong> $${totalCost}</li>
//             </ul>
//             <p>We look forward to hosting you!</p>
//             <p>Sincerely, <br>Hotel Las Torres Team</p>
//         `,
//     };

//     try {
//         await sgMail.send(msg);
//         console.log(`Email sent to ${toEmail}`);
//     } catch (error) {
//         console.error('Failed to send email:', error.message, error.response?.body);
//         throw 'Error sending confirmation email';
//     }
// };
