function goHome() {
    window.location.href = '/';
}

var map = L.map('map').setView([64, 25], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let playerLocation = null;
function resetGame() {
    fetch('/reset', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Game reset to default state.");
                fetchPlayerStats(1); 
                updateMapMarkers();  
                updateControlStats(); 
            } else {
                console.error("Failed to reset game:", data.error);
            }
        })
        .catch(error => {
            console.error("Error resetting game:", error);
        });
}

// Suorita reset, kun karttasivu ladataan
resetGame();

// Hae pelaajan sijainti ja tiedot
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
                updateMapMarkers();
            }
        })
        .catch(error => {
            console.error("Error fetching player stats:", error);
        });
}

// Päivitä kartan markerit
function updateMapMarkers() {
    $.getJSON('/locations', function(data) {
        console.log("Locations fetched:", data);
        if (data.error) {
            alert(data.error);
        } else {
            data.forEach(function(location) {
                let markerColor;

                // Värit kartalla
                if (playerLocation && location.ident === playerLocation) {
                    markerColor = 'green';
                } else if (location.owner === 'Finland') {
                    markerColor = 'blue';
                } else {
                    markerColor = 'red';
                }

                // Luo marker
                const marker = L.marker([location.latitude_deg, location.longitude_deg], {
                    icon: L.divIcon({
                        className: 'custom-icon',
                        html: `<div style="background-color:${markerColor}; width:10px; height:10px; border-radius:50%;"></div>`
                    })
                }).addTo(map);

                // Lisää popup ja hyökkäyspainike, jos lentokenttä on Venäjän hallinnassa
                const popupContent = `<b>${location.name}</b><br>Owner: ${location.owner}`;
                if (location.owner === 'Russia') {
                    marker.bindPopup(`${popupContent}<br><button onclick="attackAirport('${location.ident}')">Attack</button>`);
                } else {
                    marker.bindPopup(popupContent);
                }
            });
        }
    }).fail(function() {
        alert("Failed to load location data.");
    });
}

function updateControlStats() {
    $.getJSON('/locations', function(data) {
        if (data.error) {
            console.error("Error fetching control stats:", data.error);
        } else {
            const totalAirports = data.length;
            const finlandAirports = data.filter(location => location.owner === 'Finland').length;
            const russiaAirports = totalAirports - finlandAirports;
            const liberationPercentage = ((finlandAirports / totalAirports) * 100).toFixed(2);

            document.getElementById('control-stats').innerHTML = `
                <div><b>Finland Airports:</b> ${finlandAirports}</div>
                <div><b>Russia Airports:</b> ${russiaAirports}</div>
                <div><b>Liberation:</b> ${liberationPercentage}%</div>
            `;
        }
    }).fail(function() {
        console.error("Failed to fetch control stats.");
    });
}

function attackAirport(airportIdent) {
    fetch(`/attack/${airportIdent}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`hyokkasit ja nyt suomen hallinassa on: ${data.airport_name}`);
                updateMapMarkers(); // Päivitä kartan markerit
                updateControlStats(); // Päivitä Control Stats
            } else {
                alert("Attack failed!");
            }
        })
        .catch(error => {
            console.error("Error attacking airport:", error);
        });
}


updateControlStats();
fetchPlayerStats(1); // Pelaaja ID = 1 default
