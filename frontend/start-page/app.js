const startButton = document.getElementById("start");
const settingsButton = document.getElementById("settings");
const exitButton = document.getElementById("exit");

startButton.addEventListener("click", () => {
    startButton.remove();
    settingsButton.remove();
    exitButton.remove();

    const readText = document.createElement("p");
    readText.textContent = "Haluatko katsoa videon?";
    readText.classList.add("storytext");

    const yesButton = document.createElement("button");
    const noButton = document.createElement("button");

    yesButton.textContent = "Kyllä";
    noButton.textContent = "Ei";

    yesButton.classList.add("buton");
    noButton.classList.add("buton");

    document.body.append(readText);
    document.body.append(yesButton);
    document.body.append(noButton);

    yesButton.addEventListener("click", () => {
        readText.remove();
        yesButton.remove();
        noButton.remove();
        settingsButton.remove();
        exitButton.remove();

        const video = document.createElement("p");
        video.textContent = "video tähän"; //video tahan
        document.body.append(video);

        const skipButton = document.createElement("button");
        skipButton.textContent = "Jatka peliin";
        skipButton.classList.add("buton");

        skipButton.addEventListener("click", () => {
            video.remove()
            const storyDiv = document.getElementById("story");
            storyDiv.textContent = "peli jatkuu...";
            skipButton.remove();
        });
        document.body.append(skipButton);
    });

    noButton.addEventListener("click", () => {
        readText.remove();
        yesButton.remove();
        noButton.remove();
        settingsButton.remove();
        exitButton.remove();

        const skipButton = document.createElement("button");
        skipButton.textContent = "Jatka peliin";
        skipButton.classList.add("buton");

        skipButton.addEventListener("click", () => {
            const storyDiv = document.getElementById("story");
            storyDiv.textContent = "peli jatkuu...";
            skipButton.remove();
        });
        document.body.append(skipButton);
    });
});

settingsButton.addEventListener("click" , () => {
    startButton.remove()
    exitButton.remove()
    settingsButton.remove()
    

    const settings = document.createElement("h3")
    settings.textContent = "Asetukset"
    document.body.append(settings)
})

exitButton.addEventListener("click" , () => {
    close()
})

// store button
document.getElementById('store').addEventListener('click', function() {
    // Redirect the user to 'store.html'
    window.location.href = 'store.html';
});

exitButton.addEventListener("click", () => {
    close();
});
