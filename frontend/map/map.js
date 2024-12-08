function goHome() {
    window.location.href = '/';

}var map = L.map('map').setView([64, 25], 6);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


let playerLocation = null;

// Nollaa pelin alkuperäiseen tilaan on refresh, muutetaan jossain vaiheessa
function resetGame() {
    fetch('/reset', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Peli nollattu alkuasetuksiin.");
                fetchPlayerStats(1); // Hae pelaajan tilastot
                updateMapMarkers();  // Päivitä kartan markerit
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
function fetchPlayerStats(playerId) {
    fetch(`/player/${playerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Virhe pelaajan tietojen haussa:", data.error);
            } else {
                playerLocation = data.location.trim(); // Tallennetaan pelaajan sijainti
                console.log(`Pelaajan sijainti haettu: ${playerLocation}`);
                document.getElementById('player-stats').innerHTML = `
                    <div class="stat location"><b>Sijainti:</b> ${data.location}</div>
                    <div class="stat fuel"><b>Polttoaine:</b> ${data.fuel} km</div>
                    <div class="stat war-points"><b>Sotapisteet:</b> ${data.war_points}</div>
                `;
                updateMapMarkers(); // Päivitä kartan markerit
            }
        })
        .catch(error => {
            console.error("Virhe pelaajan tietojen haussa:", error);
        });
}

// Päivittää kartan markerit ja lisää tiedot etäisyydestä
function updateMapMarkers() {
    $.getJSON(`/locations_with_distances/${playerLocation}`, function(data) {
        console.log("Lentokenttien ja etäisyyksien tiedot haettu:", data); 
        if (data.error) {
            alert(data.error);
        } else {
            data.forEach(function(location) {
                let markerColor;

                // Määritä markerin väri omistajan mukaan
                if (playerLocation && location.ident === playerLocation) {
                    markerColor = 'green'; // Pelaajan sijainti
                } else if (location.owner === 'Finland') {
                    markerColor = 'blue'; // Suomen hallitsema
                } else {
                    markerColor = 'red'; // Venäjän hallitsema
                }

                // Lisää marker kartalle
                const marker = L.marker([location.latitude_deg, location.longitude_deg], {
                    icon: L.divIcon({
                        className: 'custom-icon',
                        html: `<div style="background-color:${markerColor}; width:15px; height:15px; border-radius:50%;"></div>`
                    })
                }).addTo(map);

                // Määritä popup-teksti
                const controlText = location.owner === 'Russia' ? 
                    "Venäjän hallinnassa" : 
                    "Sinun hallinnassasi";
                const difficultyStars = "★".repeat(location.difficulty);
                const distanceText = `Etäisyys: ${location.distance_km.toFixed(2)} km`;

                // Lisää popup tiedoilla ja hyökkäyspainikkeella
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

// Päivittää hallinnan tilastot (Suomen ja Venäjän lentokenttien määrät)
function updateControlStats() {
    $.getJSON('/locations', function(data) {
        if (data.error) {
            console.error("Virhe hallintatilastojen haussa:", data.error);
        } else {
            const totalAirports = data.length;
            const finlandAirports = data.filter(location => location.owner === 'Finland').length;
            const russiaAirports = totalAirports - finlandAirports;
            const liberationPercentage = ((finlandAirports / totalAirports) * 100).toFixed(2);

            // Päivitä käyttöliittymä hallintatilastojen osalta
            document.getElementById('control-stats').innerHTML = `
                <div><b>Suomen Lentokentät:</b> ${finlandAirports}</div>
                <div><b>Venäjän Lentokentät:</b> ${russiaAirports}</div>
                <div><b>Vapautus:</b> ${liberationPercentage}%</div>
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
                console.log(`Polttoainetta käytetty: ${data.fuel_used} km`);
                updateMapMarkers(); // Päivitä kartan markerit
                updateControlStats(); // Päivitä hallintatilastot
                fetchPlayerStats(1); // Päivitä pelaajan tilastot
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
fetchPlayerStats(1); // Pelaaja ID = 1 oletuksena
