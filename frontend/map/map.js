function goHome() {
    window.location.href = '/';
}

var map = L.map('map').setView([64, 25], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

let playerLocation = null;

// Nollaa pelin alkuperäiseen tilaan
function resetGame() {
    fetch('/reset', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Peli nollattu alkuasetuksiin.");
                fetchPlayerStats(); // Hae pelaajan tilastot
                updateMapMarkers(); // Päivitä kartan markerit
                updateControlStats(); // Päivitä hallintatilastot
            } else {
                console.error("Pelin nollaus epäonnistui:", data.error);
            }
        })
        .catch(error => {
            console.error("Virhe pelin nollauksessa:", error);
        });
}

// Suoritetaan pelin reset heti sivun latautuessa
resetGame();

// Hakee pelaajan tilastot palvelimelta ja päivittää käyttöliittymän
function fetchPlayerStats() {
    fetch(`/player/1`) // Pelaaja ID on oletuksena 1
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Virhe pelaajan tietojen haussa:", data.error);
            } else {
                playerLocation = data.location.trim(); // Tallennetaan pelaajan sijainti
                console.log(`Pelaajan sijainti haettu: ${playerLocation}`);
                document.querySelector('.player-stats').innerHTML = `
                    <h2>🎖️ OPERATIIVISET TIEDOT 🎖️</h2>
                    <div class="stat-line">
                        <span class="stat-icon">📍</span> Sijainti: <span class="value">${data.location}</span>
                    </div>
                    <div class="stat-line">
                        <span class="stat-icon">⛽</span> Polttoaine: <span class="value">${data.fuel} km</span>
                    </div>
                    <div class="stat-line">
                        <span class="stat-icon">⭐</span> Sotapisteet: <span class="value">${data.war_points}</span>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("Virhe pelaajan tietojen haussa:", error);
        });
}

// Päivittää kartan markerit ja lisää tiedot etäisyydestä
function updateMapMarkers() {
    $.getJSON(`/locations_with_distances/${playerLocation}`, function(data) {
        if (data.error) {
            alert(data.error);
        } else {
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            data.forEach(function(location) {
                let markerColor;

                if (playerLocation && location.ident === playerLocation) {
                    markerColor = 'green'; // Pelaajan sijainti
                } else if (location.owner === 'Finland') {
                    markerColor = 'blue'; // Suomen hallitsema
                } else {
                    markerColor = 'red'; // Venäjän hallitsema
                }

                const marker = L.marker([location.latitude_deg, location.longitude_deg], {
                    icon: L.divIcon({
                        className: 'custom-icon',
                        html: `<div style="background-color:${markerColor}; width:15px; height:15px; border-radius:50%;"></div>`
                    })
                }).addTo(map);

                const controlText = location.owner === 'Russia' ? 
                    "Venäjän hallinnassa" : 
                    "Sinun hallinnassasi";
                const difficultyStars = "★".repeat(location.difficulty);
                const distanceText = `Etäisyys: ${location.distance_km.toFixed(2)} km`;

                marker.bindPopup(`
                    <b>${location.name} ${difficultyStars}</b><br>
                    ${controlText}<br>
                    ${distanceText}<br>
                    <button onclick="attackAirport('${location.ident}')">Hyökkää</button>
                `);
            });
        }
    }).fail(function() {
        alert("Virhe lentokenttien tietojen haussa.");
    });
}

// Päivittää hallintatilastot
function updateControlStats() {
    $.getJSON('/locations', function(data) {
        if (data.error) {
            console.error("Virhe hallintatilastojen haussa:", data.error);
        } else {
            const totalAirports = data.length;
            const finlandAirports = data.filter(location => location.owner === 'Finland').length;
            const russiaAirports = totalAirports - finlandAirports;
            const liberationPercentage = ((finlandAirports / totalAirports) * 100).toFixed(2);

            document.querySelector('.control-stats').innerHTML = `
                <h2>🎯 TAISTELUTILANNE 🎯</h2>
                <div class="stat-line">
                    <span class="stat-icon">🇫🇮</span> Suomen Lentokentät: <span class="value">${finlandAirports}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-icon">⚔️</span> Venäjän Lentokentät: <span class="value">${russiaAirports}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-label">Vapautus: ${liberationPercentage}%</div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${liberationPercentage}%"></div>
                    </div>
                </div>
            `;
        }
    }).fail(function() {
        console.error("Hallintatilastojen haku epäonnistui.");
    });
}

// Hyökkää valittuun lentokenttään ja päivittää tilastot
function attackAirport(airportIdent) {
    fetch(`/attack/${airportIdent}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Hyökkäsit ja lentokenttä ${airportIdent} on nyt Suomen hallinnassa!`);
                updateMapMarkers();
                updateControlStats();
                fetchPlayerStats();
            } else {
                alert(`Hyökkäys epäonnistui: ${data.error}`);
            }
        })
        .catch(error => {
            console.error("Virhe hyökkäyksessä:", error);
        });
}

// Päivittää tilastot ja hakee pelaajan alkuarvot
updateControlStats();
fetchPlayerStats();
