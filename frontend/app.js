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

function openMap() {
    window.location.href = "/map"
}