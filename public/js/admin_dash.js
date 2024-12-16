document.addEventListener('DOMContentLoaded', () => {
    const roomsTable = document.querySelector('#rooms-table tbody');

    async function fetchRooms() {
        try {
            const response = await fetch('/rooms');
            const data = await response.json();
            renderRooms(data.rooms);
        } catch (e) {
            console.error('Could not get rooms', e);
        }
    }

    function renderRooms(rooms) {
        roomsTable.innerHTML = '';
        rooms.forEach((room, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${room.roomNumber}</td>
                <td>${room.availability.open ? 'Available' : room.availability.booked ? 'Booked' : 'Out of Service'}</td>
                <td class="action-buttons">
                    <button class="edit-button" onclick="editRoom(${index})">Edit</button>
                    <button class="delete-button" onclick="deleteRoom(${index})">Delete</button>
                    <button class="out-of-service-button" onclick="markOutOfService(${index})">Out of Service</button>
                </td>
            `;
            roomsTable.appendChild(row);
        });
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
});