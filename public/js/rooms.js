
(function ($) {
    //Let's get references to our form elements and the div where the todo's will go
    let roomCalendar = $('#room_calendar');
    let roomId = roomCalendar.data('room_id');
    console.log("wow", roomId);
    //When the page loads, we want to query the server to get the TODO data as raw JSON
    //Set up request config

    if (!roomId) {
        console.error("Room ID is missing. Cannot fetch availability.");
        return; // Stop execution if roomId is invalid
    }

    let requestConfig = {
    method: 'GET',
    url: `/api/${roomId}/availability`
    };

    //Make AJAX Call
    $.ajax(requestConfig).then(function (responseMessage) {
        console.log("test passed", responseMessage);
        
        const events = [
            ...(Array.isArray(responseMessage.open) ? responseMessage.open.map(date => ({
                start: date,
                display: 'background',
                color: 'green',
            })) : []),
            ...(Array.isArray(responseMessage.booked) ? responseMessage.booked.map(date => ({
                start: date,
                display: 'background',
                color: 'red',
            })) : [])
        ];
        
        const calendar = new FullCalendar.Calendar(roomCalendar[0], {
            initialView: 'dayGridMonth',
            headerToolbar: { /**gets an unknown error option but still fine */
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            },
            events: events
          });
          calendar.render();
    })
    .fail(function (error) {
        console.error('Error fetching room availability?%:', error);
    });

    //Now we are going to loop through the data, creating each element group for each todo in the data
    //Pay attention, when I'm building the html elements, I check the notDone field and display a different
    //element depending on if the todo is done or not

})(window.jQuery);
