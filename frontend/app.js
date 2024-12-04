// Hae pelaajan tila
function fetchPlayerStatus() {
    fetch('http://127.0.0.1:5000/player/1')
        .then(response => response.json())
        .then(data => {
            document.getElementById('player-status').innerText =
                `Location: ${data.location}, Fuel: ${data.fuel}, War Points: ${data.war_points}`;
        })
        .catch(error => console.error('Error:', error));
}

// Hae satunnainen lentokenttä
function fetchRandomAirport() {
    fetch('http://127.0.0.1:5000/random-airport')
        .then(response => response.json())
        .then(data => {
            const airportDiv = document.getElementById('random-airport');
            if (data.error) {
                airportDiv.innerText = data.error;
            } else {
                airportDiv.innerText = 
                    `Airport: ${data.name} (${data.ident}), Owner: ${data.owner}`;
            }
        })
        .catch(error => console.error('Error:', error));
}



// Avaa kauppa
function fetchShop() {
    fetch('http://127.0.0.1:5000/shop/1')
        .then(response => response.json())
        .then(data => {
            const shopDiv = document.getElementById('shop');
            shopDiv.innerHTML = data.map(item => 
                `<div>${item.name}: ${item.description} (${item.price} points)</div>`
            ).join('');
        })
        .catch(error => console.error('Error:', error));
}
