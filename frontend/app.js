function fetchPlayerStatus() {
    fetch('http://127.0.0.1:5000/player/1')
        .then(response => response.json())
        .then(data => {
            document.getElementById('player-status').innerText =
                `Location: ${data.location}, Fuel: ${data.fuel}, War Points: ${data.war_points}`;
        })
        .catch(error => console.error('Error:', error));
}

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
