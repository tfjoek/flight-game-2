let inventory = [];

function addToInventory(itemName) {
    inventory.push(itemName);
    saveInventory();
}

function saveInventory() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function loadInventory() {
    const savedInventory = localStorage.getItem("inventory");
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }
}

function updateInventoryDisplay() {
    const inventoryList = document.getElementById("invlist");
    inventoryList.innerHTML = "";

    if (inventory.length === 0) {
        inventoryList.innerHTML = "<li>Your inventory is empty.</li>";
    } else {
        inventory.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            inventoryList.appendChild(listItem);
        });
    }
}


function emptyInventory() {
    inventory = {};
    saveInventory();
    updateInventoryDisplay();
}

document.addEventListener("DOMContentLoaded", ()=> {
    loadInventory()
    updateInventoryDisplay()

    const emptyButton = document.getElementById("empty")
    emptyButton.addEventListener("click" ,() =>{
        emptyInventory()
    })
})