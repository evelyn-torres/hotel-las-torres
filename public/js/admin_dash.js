document.addEventListener('DOMContentLoaded', ()=> {
    const roomsTable = document.querySelector('#rooms-table tbody');

    async function fetchRooms(){
        try{
            const response = await fetch ('/rooms');
            if (!response.ok) throw new Error('Failed to fetch rooms');
            const data = await response.json();
           // const html = await response.text();
           if (!data.rooms || data.rooms.length === 0) {
            console.warn('No rooms available.');
            roomsTable.innerHTML = '<tr><td colspan="3">No rooms available</td></tr>';
            return;
        }
           renderRooms(data.rooms);
           // document.querySelector('.rooms-container').innerHTML = html;
        }catch(e){
            console.error('coould not get room', e);
        }
    }
    function renderRooms(rooms){
        roomsTable.innerHTML ='';
        rooms.forEach((room, index) =>{
            const row = document.createElement('tr');
            row.innerHTML = 
            `
            <td>${room.roomNumber}</td>
            <td>${room.availability.open ? 'Available':
                room.availability.booked ? 'Booked' : 'Out of Service'}
            </td>
            <td class="action-buttons">
                <button class='edit-button' onclick='editRooom(${index})'>Edit</button>
                <button class="delete-button" onclick="deleteRoom(${index})">Delete</button>
                <button class="out-of-service-button" onclick="markOutOfService(${index})">Out of Service</button>
            </td>  `;
            roomsTable.appendChild(row);
        })
    }
    window.editRoom = function(index) {
        const newStatus = prompt('Enter new status (Available, Booked, Out of Service):');
        if (newStatus) {
            // Update room status on the server
            // Fetch updated room data and re-render
        }
    };

    window.deleteRoom = function(index) {
        if (confirm('Are you sure you want to delete this room?')) {
            // Delete room on the server
            // Fetch updated room data and re-render
        }
    };

    window.markOutOfService = function(index) {
        // Mark room as out of service on the server
        // Fetch updated room data and re-render
    };

    fetchRooms();
})