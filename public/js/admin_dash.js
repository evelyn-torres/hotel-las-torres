document.addEventListener('DOMContentLoaded', () => {
    const roomsTable = document.querySelector('#rooms-table tbody');

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
            console.error('Could not get rooms:', e);
        }
    }

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
                const roomId = event.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this room?')) {
                    try {
                        const response = await fetch(`/rooms/${roomId}`, {
                            method: 'DELETE',
                        });
                        if (!response.ok) throw new Error('Failed to delete room');
                        alert('Room deleted successfully');
                        fetchRooms(); // Refresh the room list
                    } catch (e) {
                        console.error('Could not delete room:', e);
                        alert('Failed to delete room');
                    }
                }
            });
        });
    }

    fetchRooms();
});
