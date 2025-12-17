// ===============================
// משתני משחק
// ===============================
let gameRunning = true;
let score = 0;
let misses = 0;
let scoreSaved = false;


const MAX_MISSES = 3;
const STAR_INTERVAL_TIME = 1200;

// ===============================
// DOM Elements
// ===============================
const gameArea = document.querySelector(".game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const gameOverScreen = document.getElementById("gameOver");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");

// ===============================
// מיקום הילד
// ===============================
let playerX = 160;
let speed = 2;

// ===============================
// תזוזת הילד
// ===============================
function moveLeft() {
    if (!gameRunning) return;

    if (playerX > 0) {
        playerX -= 25;
        player.style.left = playerX + "px";
    }
}

function moveRight() {
    if (!gameRunning) return;

    if (playerX < gameArea.clientWidth - 50) {
        playerX += 25;
        player.style.left = playerX + "px";
    }
}

leftBtn.addEventListener("click", moveLeft);
rightBtn.addEventListener("click", moveRight);
leftBtn.addEventListener("touchstart", moveLeft);
rightBtn.addEventListener("touchstart", moveRight);

// ===============================
// יצירת כוכב
// ===============================
function createStar() {
    if (!gameRunning) return;

    const star = document.createElement("div");
    star.classList.add("star");
    star.textContent = "⭐";
    star.style.left = Math.random() * (gameArea.clientWidth - 30) + "px";
    gameArea.appendChild(star);

    let y = 0;

    const fall = setInterval(() => {
        if (!gameRunning) {
            star.remove();
            clearInterval(fall);
            return;
        }

        y += speed;
        star.style.top = y + "px";

        const starRect = star.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // תפיסה
        if (
            starRect.bottom >= playerRect.top &&
            starRect.left < playerRect.right &&
            starRect.right > playerRect.left
        ) {
            score++;
            scoreEl.textContent = score;
            star.remove();
            clearInterval(fall);
        }

        // פספוס
        if (y > gameArea.clientHeight) {
            star.remove();
            clearInterval(fall);

            misses++;

            if (misses >= MAX_MISSES) {
                endGame();
            }
        }
    }, 20);
}

// ===============================
// שמירת שיא וסטטיסטיקות
// ===============================
function saveBestScoreStars(currentScore) {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (!currentUserEmail) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userIndex = users.findIndex(
        user => user.email === currentUserEmail
    );

    if (userIndex === -1) return;

    const user = users[userIndex];

    // הגנה למשתמשים ישנים
    if (!user.gamesPlayed) {
        user.gamesPlayed = { memory: 0, stars: 0 };
    }

    if (!user.bestScores) {
        user.bestScores = { memory: 0, stars: 0 };
    }

    user.gamesPlayed.stars += 1;

    if (currentScore > user.bestScores.stars) {
        user.bestScores.stars = currentScore;
    }

    users[userIndex] = user;
    localStorage.setItem("users", JSON.stringify(users));
}

// ===============================
// סיום משחק
// ===============================
function endGame() {
    if (!gameRunning) return;

    gameRunning = false;
    clearInterval(starInterval);

    if (!scoreSaved) {
        saveBestScoreStars(score);
        scoreSaved = true;
    }

    gameOverScreen.classList.remove("hidden");
}

// ===============================
// התחלת המשחק
// ===============================
const starInterval = setInterval(createStar, STAR_INTERVAL_TIME);

// ===============================
// כפתורים במסך סיום
// ===============================
retryBtn.addEventListener("click", () => {
    location.reload();
});

menuBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});
