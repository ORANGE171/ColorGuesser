let targetColor = { r: 0, g: 0, b: 0 };
let currentScore = null;

const startBtn = document.getElementById("startBtn");
const colorBox = document.getElementById("colorBox");
const timeInput = document.getElementById("timeInput");
const controls = document.getElementById("controls");
const submitBtn = document.getElementById("submitBtn");
const result = document.getElementById("result");
const feedback = document.getElementById("feedback");

const rRange = document.getElementById("rRange");
const gRange = document.getElementById("gRange");
const bRange = document.getElementById("bRange");

const rValue = document.getElementById("rValue");
const gValue = document.getElementById("gValue");
const bValue = document.getElementById("bValue");
const shareBtn = document.getElementById("shareBtn");

function generateRandomColor() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

function showColor(color) {
    colorBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function hideColor() {
    colorBox.style.backgroundColor = "transparent";
}

function calculateScore(guess, target) {
    const maxDistance = Math.sqrt(3 * (255 ** 2));
    const distance = Math.sqrt(
        (guess.r - target.r) ** 2 +
        (guess.g - target.g) ** 2 +
        (guess.b - target.b) ** 2
    );

    const score = ((maxDistance - distance) / maxDistance) * 100;
    return Math.max(0, Number(score.toFixed(2)));
}

function updateSliderValues() {
    rValue.textContent = rRange.value;
    gValue.textContent = gRange.value;
    bValue.textContent = bRange.value;

    colorBox.style.backgroundColor =
        `rgb(${rRange.value}, ${gRange.value}, ${bRange.value})`;
}

startBtn.addEventListener("click", () => {
    result.textContent = "";
    feedback.textContent = "";
    controls.style.display = "none";
    currentScore = null;

    const viewTime = parseInt(timeInput.value) * 1000;

    targetColor = generateRandomColor();
    showColor(targetColor);

    setTimeout(() => {
        hideColor();
        controls.style.display = "block";
    }, viewTime);

    document.getElementById("shareBtn").style.display = "none";
    shareBtn.classList.add("hidden");
});

submitBtn.addEventListener("click", () => {
    const guess = {
        r: parseInt(rRange.value),
        g: parseInt(gRange.value),
        b: parseInt(bRange.value)
    };

    currentScore = calculateScore(guess, targetColor);

    const feedbackText = getFeedback(currentScore);

    feedback.textContent = feedbackText;

    result.textContent =
        `${currentScore}% Accurate! Target was rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b}).`;

    showColor(targetColor);

    document.getElementById("shareBtn").style.display = "block";
    shareBtn.classList.remove("hidden");
});



rRange.addEventListener("input", updateSliderValues);
gRange.addEventListener("input", updateSliderValues);
bRange.addEventListener("input", updateSliderValues);

function getFeedback(score) {
    if (score >= 95) {
        return "You should be on the Hall of Fame!";
    } else if (score >= 90) {
        return "You can definitely see colors.";
    } else if (score >= 75) {
        return "Good, I guess?!";
    } else if (score >= 50) {
        return "Umm... what should I say?";
    } else if (score >= 25) {
        return "Is your seeing or your memory bad?";
    } else {
        return "Please visit the eye doctor!";
    }
}


// Shareing result:

async function generateAndShare() {

    if (currentScore === null) {
        alert("Play the game first!");
        return;
    }

    try {
        const canvas = document.getElementById("shareCanvas");
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Choose contrasting text color
        const brightness = 
            (targetColor.r * 299 +
             targetColor.g * 587 +
             targetColor.b * 114) / 1000;

        ctx.fillStyle = brightness > 125 ? "black" : "white";

        ctx.textAlign = "center";

        // Title
        ctx.font = "bold 4rem Lacquer";
        ctx.fillText("ColorGuesser", canvas.width / 2, 130);

        // Score
        ctx.font = "bold 7rem Lacquer";
        ctx.fillText(currentScore + "%", canvas.width / 2, 320);

        // Stats
        ctx.font = "1.5rem Lacquer";
        ctx.fillText(`Target: rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`, canvas.width / 2, 420);
        ctx.fillText(`Guessed: rgb(${rRange.value}, ${gRange.value}, ${bRange.value})`, canvas.width / 2, 455);
        ctx.fillText(`Time to view color (s): ${timeInput.value}`, canvas.width / 2, 490);

        // Date
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        });
        ctx.font = "1rem Lacquer";
        ctx.fillText(`${formattedDate}`, canvas.width / 2, 550);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

        await shareImage(blob);

    } catch (err) {
        console.error("Share failed:", err);
        alert("Sharing failed!");
    }
}

async function shareImage(blob) {
    const file = new File([blob], "ColorGuesserScore.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: "ColorGuesser - My Score",
            text: `I scored ${currentScore}% in ColorGuesser!`,
            files: [file]
        });
    } else {
        alert("Sharing is not supported on this device!");
    }
}