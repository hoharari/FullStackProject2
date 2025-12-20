// ===============================
// הגדרות שלבים
// ===============================
const levels = [
    { 
        id: 1, 
        targetScore: 10, 
        speed: 3, 
        spawnRate: 1000, 
        hasBombs: false 
    },
    { 
        id: 2, 
        targetScore: 15, 
        speed: 4, 
        spawnRate: 900, 
        hasBombs: true, 
        bombChance: 0.3 // 30% סיכוי לפצצה
    },
    { 
        id: 3, 
        targetScore: 20, 
        speed: 7, // מהיר מאוד!
        spawnRate: 600, 
        hasBombs: true, 
        bombChance: 0.4 
    }
];

// משתני משחק
let currentLevelConfig = null;
let gameRunning = false;
let score = 0;
let lives = 3;
let spawnInterval;
let gameLoopInterval;

// אלמנטים ב-DOM
const levelMenu = document.getElementById("level-menu");
const levelsGrid = document.querySelector(".levels-grid");
const gameContainer = document.getElementById("game-container");
const gameArea = document.querySelector(".game-area");
const player = document.getElementById("player");

// אלמנטים של טקסט
const scoreEl = document.getElementById("score");
const targetScoreEl = document.getElementById("targetScore");
const livesEl = document.getElementById("lives");
const livesContainer = document.getElementById("livesContainer");
const currentLevelDisplay = document.getElementById("currentLevelDisplay");

// מסך סיום
const gameOverScreen = document.getElementById("gameOver");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverMessage = document.getElementById("gameOverMessage");
const nextLevelBtn = document.getElementById("nextLevelBtn");

// כפתורי שליטה
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// מיקום שחקן
let playerX = 50; // באחוזים (0-100)

// ===============================
// אתחול תפריט
// ===============================
initLevelMenu();

function initLevelMenu() {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === currentUserEmail) || {};
    
    // אם אין לו נתון של שלב מקסימלי, נתחיל מ-1
    const maxLevel = user.catcherMaxLevel || 1;

    levelsGrid.innerHTML = "";

    levels.forEach(level => {
        const btn = document.createElement("button");
        btn.classList.add("level-btn");

        if (level.id <= maxLevel) {
            btn.classList.add("unlocked");
            btn.innerHTML = `שלב ${level.id} <br> ▶️`;
            btn.onclick = () => startGame(level);
        } else {
            btn.classList.add("locked");
            btn.innerHTML = `שלב ${level.id} <br> 🔒`;
        }
        levelsGrid.appendChild(btn);
    });
}

// ===============================
// התחלת משחק
// ===============================
function startGame(levelConfig) {
    currentLevelConfig = levelConfig;
    gameRunning = true;
    score = 0;
    lives = 3;
    playerX = 50; // מרכז
    updatePlayerPosition();

    // עדכון UI
    levelMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
    
    scoreEl.textContent = score;
    targetScoreEl.textContent = levelConfig.targetScore;
    currentLevelDisplay.textContent = levelConfig.id;

    // הצגת/הסתרת חיים לפי השלב
    if (levelConfig.hasBombs) {
        livesContainer.style.display = "block";
        updateLivesDisplay();
    } else {
        livesContainer.style.display = "none";
    }

    // ניקוי אלמנטים ישנים
    document.querySelectorAll('.item').forEach(e => e.remove());

    // התחלת הלולאות
    spawnInterval = setInterval(createItem, levelConfig.spawnRate);
    gameLoopInterval = requestAnimationFrame(gameLoop);
}

// ===============================
// לוגיקת המשחק (Game Loop)
// ===============================
function createItem() {
    if (!gameRunning) return;

    const item = document.createElement("div");
    item.classList.add("item");
    
    // החלטה אם זה כוכב או פצצה
    let isBomb = false;
    if (currentLevelConfig.hasBombs && Math.random() < currentLevelConfig.bombChance) {
        isBomb = true;
        item.classList.add("bomb");
        item.textContent = "💣";
    } else {
        item.classList.add("star");
        item.textContent = "⭐";
    }

    // מיקום רנדומלי (באחוזים כדי למנוע בעיות רספונסיביות)
    item.style.left = Math.random() * 90 + "%"; 
    item.style.top = "0px";
    
    // שמירת מידע על האלמנט עצמו
    item.dataset.y = 0;
    item.dataset.isBomb = isBomb;

    gameArea.appendChild(item);
}

function gameLoop() {
    if (!gameRunning) return;

    const items = document.querySelectorAll('.item');
    const playerRect = player.getBoundingClientRect();

    items.forEach(item => {
        // תזוזה למטה
        let y = parseFloat(item.dataset.y);
        y += currentLevelConfig.speed;
        item.dataset.y = y;
        item.style.top = y + "px";

        // בדיקת התנגשות
        const itemRect = item.getBoundingClientRect();

        if (
            itemRect.bottom >= playerRect.top &&
            itemRect.right >= playerRect.left &&
            itemRect.left <= playerRect.right &&
            itemRect.top <= playerRect.bottom
        ) {
            // התנגשות!
            handleCollision(item);
        }

        // יצא מהמסך
        if (y > gameArea.clientHeight) {
            item.remove();
            // אם זה כוכב ופספסנו - זה לא נורא במשחק הזה, אבל אפשר להוסיף עונש אם רוצים
        }
    });

    gameLoopInterval = requestAnimationFrame(gameLoop);
}

function handleCollision(item) {
    const isBomb = item.dataset.isBomb === "true";
    item.remove();

    if (isBomb) {
        // אוי ואבוי - פצצה
        lives--;
        updateLivesDisplay();
        gameArea.style.backgroundColor = "#ffcccc"; // הבהוב אדום
        setTimeout(() => gameArea.style.backgroundColor = "", 200);

        if (lives <= 0) {
            gameOver(false);
        }
    } else {
        // יופי - כוכב
        score++;
        scoreEl.textContent = score;
        
        // בדיקת ניצחון
        if (score >= currentLevelConfig.targetScore) {
            gameOver(true);
        }
    }
}

function updateLivesDisplay() {
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    livesEl.textContent = hearts;
}

// ===============================
// תנועת שחקן
// ===============================
function updatePlayerPosition() {
    player.style.left = playerX + "%";
}

function moveLeft() {
    if (playerX > 5) {
        playerX -= 10;
        updatePlayerPosition();
    }
}

function moveRight() {
    if (playerX < 90) {
        playerX += 10;
        updatePlayerPosition();
    }
}

// אירועים (מקלדת + מגע)
leftBtn.addEventListener("click", moveLeft);
rightBtn.addEventListener("click", moveRight);

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
});

// ===============================
// סיום משחק וניהול שלבים
// ===============================
function gameOver(isWin) {
    gameRunning = false;
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameLoopInterval);

    gameOverScreen.classList.remove("hidden");

    if (isWin) {
        gameOverTitle.textContent = "🎉 כל הכבוד!";
        gameOverMessage.textContent = `סיימת את שלב ${currentLevelConfig.id}!`;
        
        // עדכון ניקוד כללי באתר
        updateGlobalScore(score);
        
        // פתיחת שלב הבא
        const nextLevelId = currentLevelConfig.id + 1;
        if (nextLevelId <= levels.length) {
            updateMaxLevel(nextLevelId);
            nextLevelBtn.classList.remove("hidden");
            
            // הגדרת כפתור "הבא"
            nextLevelBtn.onclick = () => {
                const nextLevel = levels.find(l => l.id === nextLevelId);
                startGame(nextLevel);
            };
        } else {
            gameOverMessage.textContent = "🏆 סיימת את כל השלבים במשחק!";
            nextLevelBtn.classList.add("hidden");
        }

    } else {
        gameOverTitle.textContent = "❌ נפסלת";
        gameOverMessage.textContent = "נתקלת ביותר מדי מכשולים!";
        nextLevelBtn.classList.add("hidden");
    }
}

// עדכונים ל-LocalStorage
function updateGlobalScore(points) {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (!currentUserEmail) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentUserEmail);

    if (userIndex !== -1) {
        users[userIndex].score = (users[userIndex].score || 0) + points;
        // עדכון סטטיסטיקות ספציפיות
        if (!users[userIndex].gamesPlayed) users[userIndex].gamesPlayed = {};
        users[userIndex].gamesPlayed.stars = (users[userIndex].gamesPlayed.stars || 0) + 1;
        
        localStorage.setItem("users", JSON.stringify(users));
    }
}

function updateMaxLevel(lvl) {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (!currentUserEmail) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentUserEmail);

    if (userIndex !== -1) {
        // עדכון רק אם השלב החדש גבוה מהקיים
        if (!users[userIndex].catcherMaxLevel || lvl > users[userIndex].catcherMaxLevel) {
            users[userIndex].catcherMaxLevel = lvl;
            localStorage.setItem("users", JSON.stringify(users));
        }
    }
}

// כפתורי תפריט סיום
document.getElementById("retryBtn").addEventListener("click", () => startGame(currentLevelConfig));
document.getElementById("menuBtn").addEventListener("click", () => {
    gameOverScreen.classList.add("hidden");
    gameContainer.classList.add("hidden");
    levelMenu.classList.remove("hidden");
    initLevelMenu(); // רענון התפריט (כדי לראות מנעולים שנפתחו)
});