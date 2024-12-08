// Päävalikon toiminnot
function startGame() {
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
}

function openSettings() {
    alert("settings prompt");
}

function quitGame() {
    alert("quit game prompt!");
}

// Pelaajan tila
function fetchPlayerStatus() {
    fetch('/player/1')
        .then(response => response.json())
        .then(data => {
            document.getElementById('player-status').innerText =
                `Location: ${data.location}, Fuel: ${data.fuel}, War Points: ${data.war_points}`;
        })
        .catch(error => console.error('Error:', error));
}

// Hae satunnainen lentokenttä
function fetchRandomAirport() {
    fetch('/random-airport')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('random-airport').innerText = data.error;
            } else {
                document.getElementById('random-airport').innerText = 
                    `Airport: ${data.name} (${data.ident}), Owner: ${data.owner}`;
            }
        })
        .catch(error => console.error('Error:', error));
}

// Kauppa
function fetchShop() {
    fetch('/shop/1')
        .then(response => response.json())
        .then(data => {
            const shopDiv = document.getElementById('shop');
            shopDiv.innerHTML = data.map(item => 
                `<div>${item.name}: ${item.description} (${item.price} points)</div>`
            ).join('');
        })
        .catch(error => console.error('Error:', error));
}

function openMap() {
    window.location.href = "/map"
}