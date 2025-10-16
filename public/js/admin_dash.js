document.addEventListener('DOMContentLoaded', () => {
    const roomsTable = document.querySelector('#rooms-table tbody');
    const addRoomButton = document.querySelector('.add-room-button');


    async function fetchRooms() {
        try {
            const response = await fetch('/rooms');
            if (!response.ok) throw new Error('Failed to fetch rooms');
            const data = await response.json();
            if (!data.rooms || data.rooms.length === 0) {
                roomsTable.innerHTML = '<tr><td colspan="3">No rooms available</td></tr>';
                return;
            }
            renderRooms(data.rooms);
        } catch (e) {
            throw `Could not get rooms: ${e}`;
        }
    };

    function renderRooms(rooms) {
        roomsTable.innerHTML = '';
        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${room.roomNumber}</td>
                <td>${room.availability.open ? 'Available' : room.availability.booked ? 'Booked' : 'Out of Service'}</td>
                <td class="action-buttons">
                    <button class="edit-button">Edit</button>
                    <button class="delete-button" data-id="${room._id}">Delete</button>
                    <button class="out-of-service-button">Out of Service</button>
                </td>`;
            roomsTable.appendChild(row);
        });

        // Add click event listeners to delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();

                const roomId = event.target.getAttribute('data-id');
                // console.log('data-id', data-id)
                if (confirm('Are you sure you want to delete this room?')) {
                    try {
                        // console.log('in front-end try for delete');
                        const response = await fetch(`/rooms/${roomId}`, {
                            method: 'DELETE',
                        });
                        const result = await response.json();
                        if (result.deleted){
                            alert('Reservation Deleted!');
                            safeRefreshCalendar();

                        }
                       
                        fetchRooms(); // Refresh the room list
                    } catch (e) {
                        throw('Could not delete room:', e);
                      //  alert('Failed to delete room');
                    }
                }
            });
        });
        if(addRoomButton){
            let errors = [];
            addRoomButton.addEventListener('click', (event) =>{
                event.preventDefault();
                const form = document.querySelector('form[action="rooms/addRoomForm"]');
                if(!form){
                    throw ('Error: Add room option is not available right now');
                }
                const roomName = document.querySelector('#roomName').value.trim();
                const pricingPerNight = parseFloat(document.querySelector('#pricingPerNight').value);
                const balcony = document.querySelector('#balcony').value;
                const bedSizes = document.querySelector('#bedSizes').value.trim();

                if (!roomName || roomName === '') {
                    errors.push('Room Name is required.');
                    return;
                }
    
                if (!pricingPerNight || pricingPerNight < 10) {
                    errors.push('Pricing Per Night must be at least $10.');
                    return;
                }
    
                if (!bedSizes.match(/^[a-zA-Z\s]+(,\s*[a-zA-Z\s]+)*$/)) {
                    errors.push('Invalid bed sizes format. Use comma-separated values (e.g., Queen, Twin).');
                    return;
                }
                form.submit();
                
            });
        }

        
        
    }


    fetchRooms();
});
