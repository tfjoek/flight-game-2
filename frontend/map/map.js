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
// Hakee pelaajan tilastot palvelimelta ja päivittää käyttöliittymän
function fetchPlayerStats() {
    fetch(`/player/1`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Virhe pelaajan tietojen haussa:", data.error);
            } else {
                playerLocation = data.location.trim();
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
                
                updateMapMarkers();
            }
        })
        .catch(error => {
            console.error("Virhe pelaajan tietojen haussa:", error);
        });
}

// Päivittää kartan markerit ja lisää tiedot etäisyydestä
function updateMapMarkers() {
    if (!playerLocation) {
        console.error("Player location not set");
        return;
    }

    console.log("Updating markers with player location:", playerLocation);

    $.getJSON(`/locations_with_distances/${playerLocation}`, function(data) {
        if (data.error) {
            alert(data.error);
        } else {
            // tyhjaa
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // lisaa
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
                        html: `<div style="background-color:${markerColor}; width:20px; height:20px; border-radius:50%;"></div>`
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
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load locations:", textStatus, errorThrown);
        alert("Virhe lentokenttien tietojen haussa.");
    });
}

// Päivittää kartan markerit ja lisää tiedot etäisyydestä
function updateMapMarkers() {
    if (!playerLocation) {
        console.error("Player location not set");
        return;
    }

    console.log("Updating markers with player location:", playerLocation);

    $.getJSON(`/locations_with_distances/${playerLocation}`, function(data) {
        if (data.error) {
            alert(data.error);
        } else {
            // Clear existing markers
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add new markers
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
                        html: `<div style="background-color:${markerColor}; width:20px; height:20px; border-radius:50%;"></div>`
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
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load locations:", textStatus, errorThrown);
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
// Hyökkää valittuun lentokenttään ja päivittää tilastot
function attackAirport(airportIdent) {
    // Fetch player stats first to get current fuel
    fetch(`/player/1`)
        .then(response => response.json())
        .then(playerData => {
            if (playerData.error) {
                console.error("Virhe pelaajan tietojen haussa:", playerData.error);
                return;
            }

            const playerFuel = playerData.fuel;

            // Then fetch airport data with distances
            $.getJSON(`/locations_with_distances/${playerData.location}`, function(airportsData) {
                const targetAirport = airportsData.find(loc => loc.ident === airportIdent);
                
                if (!targetAirport) {
                    alert('Kohdelentokenttää ei löydy!');
                    return;
                }

                // Check if player has enough fuel
                if (playerFuel < targetAirport.distance_km) {
                    alert(`Polttoaine ei riitä! Tarvitset ${targetAirport.distance_km.toFixed(2)} km, mutta sinulla on vain ${playerFuel} km polttoainetta.`);
                    return;
                }

                // Check if airport is already owned by Finland
                if (targetAirport.owner === 'Finland') {
                    alert('Lentokenttä on jo sinun hallinnassasi!');
                    return;
                }

                // If all checks pass, initiate combat
                initiateCombat(airportIdent, targetAirport.difficulty);
            });
        })
        .catch(error => {
            console.error("Virhe hyökkäyksen valmistelussa:", error);
            alert("Virhe hyökkäyksen valmistelussa!");
        });
}
//THE COMBAT SYSTEM VERY BIG 
//THE COMBAT SYSTEM VERY BIG 
//THE COMBAT SYSTEM VERY BIG 
//THE COMBAT SYSTEM VERY BIG 
//THE COMBAT SYSTEM VERY BIG 
// Stats
let currentCombat = {
    playerMaxHP: 100,
    playerHP: 100,
    enemyMaxHP: 100,
    enemyHP: 100,
    isPlayerTurn: true,
    targetAirport: null,
    difficulty: 1
};

// Alottaa combat
function initiateCombat(airportIdent, difficulty) {
    console.log('testing initiating combat:', airportIdent, difficulty); 
    currentCombat.targetAirport = airportIdent;
    currentCombat.difficulty = difficulty;
    currentCombat.enemyMaxHP = difficulty * 20; // 5 stars = 100HP, 4 stars = 80HP, etc.
    currentCombat.enemyHP = currentCombat.enemyMaxHP;
    currentCombat.playerHP = currentCombat.playerMaxHP;
    currentCombat.isPlayerTurn = true;
    
    updateHealthBars();
    document.getElementById('combatModal').style.display = 'block';
    document.getElementById('combatLog').innerHTML = 'Taistelu alkaa!';
}


// Update hp bar
function updateHealthBars() {
    const playerBar = document.getElementById('playerHP');
    const enemyBar = document.getElementById('enemyHP');
    
    const playerPercent = (currentCombat.playerHP / currentCombat.playerMaxHP) * 100;
    const enemyPercent = (currentCombat.enemyHP / currentCombat.enemyMaxHP) * 100;
    
    playerBar.style.width = `${playerPercent}%`;
    enemyBar.style.width = `${enemyPercent}%`;
    
    playerBar.textContent = `${currentCombat.playerHP}/${currentCombat.playerMaxHP}`;
    enemyBar.textContent = `${currentCombat.enemyHP}/${currentCombat.enemyMaxHP}`;
}

// Log message
function addCombatLog(message) {
    const log = document.getElementById('combatLog');
    log.innerHTML += `<br>${message}`;
    log.scrollTop = log.scrollHeight;
}

// Combat actionit
function playerAttack() {
    if (!currentCombat.isPlayerTurn) return;
    
    const damage = Math.floor(Math.random() * 20) + 10; // 10-30 damage
    currentCombat.enemyHP = Math.max(0, currentCombat.enemyHP - damage);
    addCombatLog(`Sinä hyökkäät ja teet ${damage} vahinkoa!`);
    
    updateHealthBars();
    currentCombat.isPlayerTurn = false;
    
    if (currentCombat.enemyHP <= 0) {
        endCombat(true);
    } else {
        setTimeout(enemyTurn, 1000);
    }
}

function playerDefend() {
    if (!currentCombat.isPlayerTurn) return;
    
    currentCombat.playerHP = Math.min(currentCombat.playerMaxHP, currentCombat.playerHP + 15);
    addCombatLog('Puolustaudut ja parannat 15 HP!');
    
    updateHealthBars();
    currentCombat.isPlayerTurn = false;
    setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
    const damage = Math.floor(Math.random() * 15) + 5; // 5-20 damage
    currentCombat.playerHP = Math.max(0, currentCombat.playerHP - damage);
    addCombatLog(`Vihollinen hyökkää ja tekee ${damage} vahinkoa!`);
    
    updateHealthBars();
    currentCombat.isPlayerTurn = true;
    
    if (currentCombat.playerHP <= 0) {
        endCombat(false);
    }
}

function retreat() {
    addCombatLog('Pakenet taistelusta!');
    setTimeout(() => {
        document.getElementById('combatModal').style.display = 'none';
    }, 1000);
}

function endCombat(victory) {
    if (victory) {
        addCombatLog('Voitit taistelun! Lentokenttä on nyt sinun!');
        fetch(`/attack/${currentCombat.targetAirport}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setTimeout(() => {
                        document.getElementById('combatModal').style.display = 'none';
                        updateMapMarkers();
                        updateControlStats();
                        fetchPlayerStats();
                    }, 2000);
                }
            });
    } else {
        addCombatLog('Hävisit taistelun!');
        setTimeout(() => {
            document.getElementById('combatModal').style.display = 'none';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('attackBtn').addEventListener('click', playerAttack);
    document.getElementById('defendBtn').addEventListener('click', playerDefend);
    document.getElementById('retreatBtn').addEventListener('click', retreat);
});
updateControlStats();
fetchPlayerStats();
