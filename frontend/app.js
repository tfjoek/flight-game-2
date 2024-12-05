const startButton = document.getElementById("start")

startButton.addEventListener("click", () => {
    startButton.remove()

    const yesButton = document.createElement("button")
    const noButton = document.createElement("button")

    yesButton.textContent = "Kyllä"
    noButton.textContent = "Ei"

    yesButton.addEventListener("click", () => {
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
        const storyDiv = document.getElementById("story")
        storyDiv.textContent = "Et halunnut lukea tarinaa :("

        yesButton.remove()
        noButton.remove()

        const skipButton = document.createElement("button")
        skipButton.textContent = "Jatka peliin"

        skipButton.addEventListener("click", () => {
            storyDiv.textContent = "peli jatkuu..."
            skipButton.remove()
        })
        document.body.append(skipButton)
    })
    document.body.append(yesButton)
    document.body.append(noButton)
})