
// (function ($) {
//     //Let's get references to our form elements and the div where the todo's will go
//     let roomCalendar = $('#room_calendar');
//     let roomId = roomCalendar.data('room_id');
//     console.log("wow", roomId);
//     let calendar; //this stored the fullcalendar globally

//     //When the page loads, we want to query the server to get the TODO data as raw JSON
//     //Set up request config

//     if (!roomId) {
//         console.error("Room ID is missing. Cannot fetch availability.");
//         return; // Stop execution if roomId is invalid
//     }

//     async function initCalendar(){
//         try{
//              let requestConfig = {
//                 method: 'GET',
//                 url: `/rooms/${roomId}/availability`
//             };
            


//         }catch (err){
//                 console.log('Error getting availability');
//         }
//     }

   
//     //Make AJAX Call
//     $.ajax(requestConfig).then(function (responseMessage) {
//         console.log("test passed", responseMessage);
//         console.log("response messages book or open: ", responseMessage.booked);
//         const events = [
//             ...(Array.isArray(responseMessage.open) ? responseMessage.open.map(date => ({
//                 start: date,
//                 display: 'background',
//                 color: 'green',
//             })) : []),
//             ...(Array.isArray(responseMessage.booked) ? responseMessage.booked.map(date => ({
//                 start: date,
//                 display: 'background',
//                 color: 'red',
//             })) : [])
//         ];
        
//         const calendar = new FullCalendar.Calendar(roomCalendar[0], {
//             initialView: 'dayGridMonth',
//             headerToolbar: { /**gets an unknown error option but still fine */
//               left: 'prev,next today',
//               center: 'title',
//               right: 'dayGridMonth,timeGridWeek'
//             },
//             events: events
//           });
//           calendar.render();
//     })
//     .fail(function (error) {
//         console.error('Error fetching room availability?%:', error);
//     });

//     //Now we are going to loop through the data, creating each element group for each todo in the data
//     //Pay attention, when I'm building the html elements, I check the notDone field and display a different
//     //element depending on if the todo is done or not

// })(window.jQuery);

(function ($) {
    let roomCalendar = $('#room_calendar');
    let roomId = roomCalendar.data('room_id');
    let calendar; // store FullCalendar instance globally within this closure

    if (!roomId) {
        console.error("Room ID is missing. Cannot fetch availability.");
        return;
    }

    // Function to fetch and render the calendar
    async function initCalendar() {
        if (!roomCalendar.length || !roomId) {
        console.log("No room calendar present on this page — skipping refresh.");
        return;
    }
        try {
            const response = await $.ajax({
                method: 'GET',
                url: `/rooms/${roomId}/availability`
            });

            console.log("Fetched availability:", response);

            const events = [
                ...(Array.isArray(response.open)
                    ? response.open.map(date => ({
                        start: date,
                        display: 'background',
                        color: 'green'
                    }))
                    : []),
                ...(Array.isArray(response.booked)
                    ? response.booked.map(date => ({
                        start: date,
                        display: 'background',
                        color: 'red'
                    }))
                    : [])
            ];

            // If the calendar has already been created, just update it
            if (calendar) {
                calendar.removeAllEvents();
                calendar.addEventSource(events);
                calendar.render();
                console.log("✅ Calendar refreshed successfully");
                return;
            }

            // Otherwise, initialize a new FullCalendar instance
            calendar = new FullCalendar.Calendar(roomCalendar[0], {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                },
                events: events
            });

            calendar.render();
            console.log("✅ Calendar initialized");

        } catch (err) {
            console.error('Error fetching room availability:', err);
        }
    }

    // Expose refreshCalendar globally (so you can call it after deleting a reservation)
    window.refreshCalendar = initCalendar;

    // Initialize on page load
    initCalendar();

})(window.jQuery);


