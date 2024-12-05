function goHome() {
    window.location.href = '/';
}

var map = L.map('map').setView([64, 25], 6);
        
// visuaalinen kartta osm
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ANNA LENTOKENTÄT DATABASEST
$.getJSON('/locations', function(data) {
    if (data.error) {
        alert(data.error);
    } else {
        data.forEach(function(location) {
            L.marker([location.latitude_deg, location.longitude_deg])
                .addTo(map)
                .bindPopup(`<b>${location.name}</b>`);
        });
    }
}).fail(function() {
    alert("Failed to load location data.");
});