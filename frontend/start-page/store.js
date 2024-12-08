// random funktio et nappi toimii 
function buyItem(itemName) {
    addToInventory(itemName);
    alert(`Ostit ${itemName} ja se on lisätty inventaarioon! `);
    updateInventoryDisplay(); 
}

