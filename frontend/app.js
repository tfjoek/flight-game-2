// Päävalikon toiminnot
function startGame() {
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
}

function openSettings() {
    alert("I DO NOTHING HAHAHAHAHAHA");
}

function quitGame() {
    window.location.href = "/goodbye";
}
function openMap() {
    window.location.href = "/map";
}