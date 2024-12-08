const startButton = document.getElementById("start")
const startVideoButton = document.getElementById("start-video")
const settingsButton = document.getElementById("settings")
const exitButton = document.getElementById("exit")

startButton.addEventListener("click", () => {
    startButton.remove()
    settingsButton.remove()
    exitButton.remove()

    const readText = document.createElement("p")
    readText.textContent = "Haluatko lukea tarinan?"
    readText.classList.add("storytext")

    const yesButton = document.createElement("button")
    const noButton = document.createElement("button")

    yesButton.textContent = "Kyllä"
    noButton.textContent = "Ei"

    yesButton.classList.add("buton")
    noButton.classList.add("buton")

    document.body.append(readText)

    yesButton.addEventListener("click", () => {
        readText.remove()
        settingsButton.remove()
        exitButton.remove()
        fetch("story.txt")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Tarinaa ei löytynyt!")
                }
                return response.text()
            })
            .then (story => {
                const storyDiv = document.getElementById("story")
                storyDiv.textContent = story

                yesButton.remove()
                noButton.remove()

                const skipButton = document.createElement("button")
                skipButton.textContent = "Jatka peliin"
                skipButton.classList.add("buton")

                skipButton.addEventListener("click", () => {
                    storyDiv.textContent = "peli jatkuu..." 
                    skipButton.remove()
                })
                document.body.append(skipButton)
            })    
            .catch(error => {
                console.error(error)
            })
    })
    noButton.addEventListener("click", () => {
        readText.remove()
        settingsButton.remove()
        exitButton.remove()
        
        yesButton.remove()
        noButton.remove()

        const skipButton = document.createElement("button")
        skipButton.textContent = "Jatka peliin"
        skipButton.classList.add("buton")

        skipButton.addEventListener("click", () => {
            const storyDiv = document.getElementById("story")
            storyDiv.textContent = "peli jatkuu..."
            skipButton.remove()
        })
        document.body.append(skipButton)
    })
    document.body.append(yesButton)
    document.body.append(noButton)
})

// Event listener
startVideoButton.addEventListener('click', function() {
    // Vie video html
    window.location.href = 'story-video.html'; 
});

exitButton.addEventListener("click" , () => {
    close()
})