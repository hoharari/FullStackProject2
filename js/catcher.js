
// ===============================
// משתני משחק
// ===============================
let gameRunning = true;
let score = 0;
let misses = 0;
let scoreSaved = false;

// משתני קושי (דרישת חובה: רמות קושי משתנות)
let speed = 2;          // מהירות התחלתית
const SPEED_INC = 0.5;  // בכמה המהירות עולה
const LEVEL_STEP = 5;   // כל כמה נקודות המהירות עולה
const MAX_MISSES = 3;

// טיימר ליצירת כוכבים
let starInterval;
const STAR_INTERVAL_TIME = 1200;

// ===============================
// אלמנטים מה-DOM
// ===============================
const gameArea = document.querySelector(".game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");

// כפתורי מגע
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// מסך סיום
const gameOverScreen = document.getElementById("gameOver");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");

// ===============================
// ניהול תנועת השחקן
// ===============================
let playerX = 160; 

function updatePlayerPosition() {
    player.style.left = playerX + "px";
}

function moveLeft() {
    if (!gameRunning) return;
    if (playerX > 0) {
        playerX -= 25;
        updatePlayerPosition();
    }
}

function moveRight() {
    if (!gameRunning) return;
    // 60 הוא רוחב משוער של השחקן כדי שלא יצא מהמסך
    if (playerX < gameArea.clientWidth - 60) {
        playerX += 25;
        updatePlayerPosition();
    }
}

// מאזינים לכפתורי מסך (למובייל/טאבלט)
leftBtn.addEventListener("click", moveLeft);
rightBtn.addEventListener("click", moveRight);

// מאזינים למקלדת (למחשב - דרישת נגישות/נוחות)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
});

// ===============================
// לוגיקת המשחק: יצירת כוכבים וקושי
// ===============================
function createStar() {
    if (!gameRunning) return;

    // יצירת אלמנט DOM חדש
    const star = document.createElement("div");
    star.classList.add("star");
    star.textContent = "⭐";
    
    // מיקום רנדומלי בתוך גבולות המשחק
    star.style.left = Math.random() * (gameArea.clientWidth - 40) + "px";
    gameArea.appendChild(star);

    let y = 0;

    // לולאת נפילה ספציפית לכל כוכב
    const fall = setInterval(() => {
        if (!gameRunning) {
            star.remove();
            clearInterval(fall);
            return;
        }

        y += speed; // המהירות משתנה לפי השלב הנוכחי
        star.style.top = y + "px";

        const starRect = star.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // בדיקת התנגשות (Collision Detection)
        if (
            starRect.bottom >= playerRect.top &&
            starRect.left < playerRect.right &&
            starRect.right > playerRect.left
        ) {
            handleCatch(star, fall);
        }

        // בדיקה אם הכוכב יצא מהמסך (פספוס)
        if (y > gameArea.clientHeight) {
            handleMiss(star, fall);
        }
    }, 20);
}

// טיפול בתפיסה מוצלחת
function handleCatch(star, intervalId) {
    score++;
    scoreEl.textContent = score;
    
    // === שינוי רמת קושי! ===
    // כל X נקודות - המהירות עולה
    if (score % LEVEL_STEP === 0) {
        speed += SPEED_INC;
        
        // אפקט ויזואלי קטן לעליית שלב
        gameArea.style.boxShadow = "0 0 25px #ffd700";
        setTimeout(() => gameArea.style.boxShadow = "", 500);
    }

    star.remove();
    clearInterval(intervalId);
}

// טיפול בפספוס
function handleMiss(star, intervalId) {
    star.remove();
    clearInterval(intervalId);
    misses++;

    if (misses >= MAX_MISSES) {
        endGame();
    }
}

// ===============================
// שמירת נתונים (Local Storage)
// ===============================
function saveBestScoreStars(currentScore) {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (!currentUserEmail) return; // לא שומרים לאורחים

    let users = JSON.parse(localStorage.getItem("users")) || [];
    // מציאת המשתמש ועדכון המצביע שלו (לא עותק)
    const userIndex = users.findIndex(u => u.email === currentUserEmail);

    if (userIndex !== -1) {
        const user = users[userIndex];
        
        // אתחול אובייקטים אם חסרים
        if (!user.gamesPlayed) user.gamesPlayed = {};
        if (!user.bestScores) user.bestScores = {};

        // עדכון סטטיסטיקות
        user.gamesPlayed.stars = (user.gamesPlayed.stars || 0) + 1;
        
        if (currentScore > (user.bestScores.stars || 0)) {
            user.bestScores.stars = currentScore;
        }
        
        // עדכון ניקוד כללי באתר
        user.score = (user.score || 0) + currentScore;

        // שמירה חזרה
        users[userIndex] = user;
        localStorage.setItem("users", JSON.stringify(users));
    }
}

// ===============================
// סיום ואתחול משחק
// ===============================
function endGame() {
    if (!gameRunning) return;

    gameRunning = false;
    clearInterval(starInterval);

    if (!scoreSaved) {
        saveBestScoreStars(score);
        scoreSaved = true;
    }

    // ניקוי המסך מכוכבים שנשארו
    document.querySelectorAll('.star').forEach(s => s.remove());
    
    gameOverScreen.classList.remove("hidden");
}

// התחלת המשחק
starInterval = setInterval(createStar, STAR_INTERVAL_TIME);

// כפתורי ניווט בסוף משחק
retryBtn.addEventListener("click", () => location.reload());
menuBtn.addEventListener("click", () => window.location.href = "../dashboard.html");