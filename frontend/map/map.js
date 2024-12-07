function goHome() {
    window.location.href = '/';
}

var map = L.map('map').setView([64, 25], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let playerLocation = null;

// Hae pelaajan tilastot
function fetchPlayerStats(playerId) {
    fetch(`/player/${playerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error fetching player stats:", data.error);
            } else {
                playerLocation = data.location.trim();
                console.log(`Player location fetched: ${playerLocation}`);
                document.getElementById('player-stats').innerHTML = `
                    <div class="stat location"><b>Location:</b> ${data.location}</div>
                    <div class="stat fuel"><b>Fuel:</b> ${data.fuel} km</div>
                    <div class="stat war-points"><b>War Points:</b> ${data.war_points}</div>
                `;
                updateControlStats(); // Päivitä kontrollitiedot
                updateMapMarkers(); // Päivitä markerit
            }
        })
        .catch(error => {
            console.error("Error fetching player stats:", error);
        });
}

// Päivitä lentokenttien kontrollitiedot
function updateControlStats() {
    $.getJSON('/locations', function(data) {
        let finlandAirports = 0;
        let russiaAirports = 0;

        data.forEach(function(location) {
            if (location.owner === 'Finland') {
                finlandAirports++;
            } else if (location.owner === 'Russia') {
                russiaAirports++;
            }
        });

        const totalAirports = finlandAirports + russiaAirports;
        const liberationPercentage = ((finlandAirports / totalAirports) * 100).toFixed(2);

        document.getElementById('control-stats').innerHTML = `
            <div class="stat finland">Finland Airports: ${finlandAirports}</div>
            <div class="stat russia">Russia Airports: ${russiaAirports}</div>
            <div class="stat liberation">Liberation: ${liberationPercentage}%</div>
        `;
    }).fail(function() {
        alert("Failed to load location data.");
    });
}

// Päivitä markerit kartalle
function updateMapMarkers() {
    $.getJSON('/locations', function(data) {
        data.forEach(function(location) {
            let markerColor;

            if (playerLocation && location.ident === playerLocation) {
                markerColor = 'green';
            } else if (location.owner === 'Finland') {
                markerColor = 'blue';
            } else {
                markerColor = 'red';
            }

            const marker = L.marker([location.latitude_deg, location.longitude_deg], {
                icon: L.divIcon({
                    className: 'custom-icon',
                    html: `<div style="background-color:${markerColor}; width:10px; height:10px; border-radius:50%;"></div>`
                })
            }).addTo(map);

            marker.bindPopup(`<b>${location.name}</b><br>Owner: ${location.owner}`);
        });
    }).fail(function() {
        alert("Failed to load location data.");
    });
}

// Alusta pelaajan tilastot ja kartta
fetchPlayerStats(1);
