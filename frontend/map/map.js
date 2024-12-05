function goHome() {
    window.location.href = '/';
}

var map = L.map('map').setView([64, 25], 6);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Playe stat rs
function fetchPlayerStats(playerId) {
    fetch(`/player/${playerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('player-stats').innerText = "Error fetching player stats.";
            } else {
                document.getElementById('player-stats').innerHTML = `
                    <p><b>Location:</b> ${data.location}</p>
                    <p><b>Fuel:</b> ${data.fuel} km</p>
                    <p><b>War Points:</b> ${data.war_points}</p>
                `;
            }
        })
        .catch(error => console.error("Error fetching player stats:", error));
}

// Fetch and add markers 
$.getJSON('/locations', function(data) {
    if (data.error) {
        alert(data.error);
    } else {
        data.forEach(function(location) {
            const ownerColor = location.owner === 'Russia' ? 'red' : 'blue';
            const marker = L.marker([location.latitude_deg, location.longitude_deg], {
                icon: L.divIcon({
                    className: 'custom-icon',
                    html: `<div style="background-color:${ownerColor}; width:10px; height:10px; border-radius:50%;"></div>`
                })
            }).addTo(map);

            // Owner popup
            marker.bindPopup(`<b>${location.name}</b><br>Owner: ${location.owner}`);
        });
    }
}).fail(function() {
    alert("Failed to load location data.");
});

fetchPlayerStats(1); // Player id pitais olla 1 by default!
