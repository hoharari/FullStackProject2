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

// מסך סיום - משתנים חדשים למודל
const modal = document.getElementById("gameCompleteModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
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
    
    const maxLevel = user.catcherMaxLevel || 1;

    levelsGrid.innerHTML = "";

    levels.forEach(level => {
        const btn = document.createElement("button");
        btn.classList.add("level-btn");

        if (level.id <= maxLevel) {
            btn.classList.add("unlocked");
            btn.innerHTML = `שלב ${level.id}`;
            btn.onclick = () => startGame(level);
        } else {
            btn.classList.add("locked");
            btn.innerHTML = `🔒 <br> שלב ${level.id}`;
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
    playerX = 50; 
    updatePlayerPosition();

    // עדכון UI
    levelMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    modal.classList.add("hidden"); // הסתרת המודל
    
    scoreEl.textContent = score;
    targetScoreEl.textContent = levelConfig.targetScore;
    currentLevelDisplay.textContent = levelConfig.id;

    if (levelConfig.hasBombs) {
        livesContainer.style.display = "block";
        updateLivesDisplay();
    } else {
        livesContainer.style.display = "none";
    }

    document.querySelectorAll('.item').forEach(e => e.remove());

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
    
    let isBomb = false;
    if (currentLevelConfig.hasBombs && Math.random() < currentLevelConfig.bombChance) {
        isBomb = true;
        item.classList.add("bomb");
        item.textContent = "💣";
    } else {
        item.classList.add("star");
        item.textContent = "⭐";
    }

    item.style.left = Math.random() * 90 + "%"; 
    item.style.top = "0px";
    
    item.dataset.y = 0;
    item.dataset.isBomb = isBomb;

    gameArea.appendChild(item);
}

function gameLoop() {
    if (!gameRunning) return;

    const items = document.querySelectorAll('.item');
    const playerRect = player.getBoundingClientRect();

    items.forEach(item => {
        let y = parseFloat(item.dataset.y);
        y += currentLevelConfig.speed;
        item.dataset.y = y;
        item.style.top = y + "px";

        const itemRect = item.getBoundingClientRect();

        if (
            itemRect.bottom >= playerRect.top &&
            itemRect.right >= playerRect.left &&
            itemRect.left <= playerRect.right &&
            itemRect.top <= playerRect.bottom
        ) {
            handleCollision(item);
        }

        if (y > gameArea.clientHeight) {
            item.remove();
        }
    });

    gameLoopInterval = requestAnimationFrame(gameLoop);
}

function handleCollision(item) {
    const isBomb = item.dataset.isBomb === "true";
    item.remove();

    if (isBomb) {
        lives--;
        updateLivesDisplay();
        gameArea.style.backgroundColor = "#ffcccc"; 
        setTimeout(() => gameArea.style.backgroundColor = "", 200);

        if (lives <= 0) {
            gameOver(false);
        }
    } else {
        score++;
        scoreEl.textContent = score;
        
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

    modal.classList.remove("hidden"); // פתיחת המודל החדש

    if (isWin) {
        modalTitle.textContent = "🎉 כל הכבוד!";
        modalMessage.textContent = `סיימת את שלב ${currentLevelConfig.id}!`;
        
        updateGlobalScore(score);
        
        const nextLevelId = currentLevelConfig.id + 1;
        if (nextLevelId <= levels.length) {
            updateMaxLevel(nextLevelId);
            nextLevelBtn.classList.remove("hidden");
            
            nextLevelBtn.onclick = () => {
                modal.classList.add("hidden");
                const nextLevel = levels.find(l => l.id === nextLevelId);
                startGame(nextLevel);
            };
        } else {
            modalMessage.textContent = "🏆 סיימת את כל השלבים במשחק!";
            nextLevelBtn.classList.add("hidden");
        }

    } else {
        modalTitle.textContent = "❌ נפסלת";
        modalMessage.textContent = "נתקלת ביותר מדי פצצות!";
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
        
        // שמירת ניקוד ספציפי לתפוס את הכוכב (חשוב לטבלה החדשה)
        users[userIndex].catcherScore = (users[userIndex].catcherScore || 0) + points;
        
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
        if (!users[userIndex].catcherMaxLevel || lvl > users[userIndex].catcherMaxLevel) {
            users[userIndex].catcherMaxLevel = lvl;
            localStorage.setItem("users", JSON.stringify(users));
        }
    }
}

// מאזינים לכפתורי המודל
document.getElementById("retryBtn").addEventListener("click", () => {
    modal.classList.add("hidden");
    startGame(currentLevelConfig);
});

document.getElementById("menuBtn").addEventListener("click", () => {
    modal.classList.add("hidden");
    gameContainer.classList.add("hidden");
    levelMenu.classList.remove("hidden");
    initLevelMenu();
});