document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('hotel-map').setView([4.620903, -75.763597], 13); 

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);


    L.marker([4.620903, -75.763597]) 
        .addTo(map)
        .bindPopup('<b>Hotel Las Torres</b><br>Quimbaya, Quindio, Colombia')
        .openPopup();
});