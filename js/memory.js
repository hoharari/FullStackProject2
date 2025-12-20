document.addEventListener("DOMContentLoaded", () => {
    // מאגר אייקונים מורחב
    const allIcons = [
        "🚀", "🎮", "👻", "💎", "🦄", "🍕", "🎸", "🐱",
        "🍔", "⚽", "🚗", "🌟", "🎈", "🍦", "👑", "🍀",
        "🐶", "🍄", "🍩", "🌍", "🍉", "🔥", "🌈", "🦜"
    ];

    // הגדרות 4 השלבים
    const levels = [
        { id: 1, pairs: 2 },  // 4 קלפים (2x2)
        { id: 2, pairs: 6 },  // 12 קלפים (4x3)
        { id: 3, pairs: 8 },  // 16 קלפים (4x4)
        { id: 4, pairs: 10 }  // 20 קלפים (5x4)
    ];

    let currentLevelConfig = null;
    let gameInterval;
    let seconds = 0;
    let moves = 0;
    let matches = 0;
    
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;

    // אלמנטים
    const levelMenu = document.getElementById("level-menu");
    const levelsGrid = document.querySelector(".levels-grid");
    const gameArea = document.getElementById("game-area");
    const gameGrid = document.getElementById("game-grid");
    const timerEl = document.getElementById("timer");
    const movesEl = document.getElementById("moves");
    const currentLevelDisplay = document.getElementById("currentLevelDisplay");
    
    // מודלים
    const levelCompleteModal = document.getElementById("levelCompleteModal");
    const gameCompleteModal = document.getElementById("gameCompleteModal");
    const nextLevelBtn = document.getElementById("nextLevelBtn");

    // אתחול
    initLevelMenu();

    function initLevelMenu() {
        const user = getCurrentUser();
        const maxLevel = user.memoryMaxLevel || 1; 

        levelsGrid.innerHTML = ""; 

        levels.forEach(level => {
            const btn = document.createElement("button");
            btn.classList.add("level-btn");
            
            if (level.id <= maxLevel) {
                btn.classList.add("unlocked");
                btn.innerHTML = `שלב ${level.id} <span>▶️</span>`;
                btn.onclick = () => startGame(level);
            } else {
                btn.classList.add("locked");
                btn.innerHTML = `שלב ${level.id} <span class="lock-icon">🔒</span>`;
            }

            levelsGrid.appendChild(btn);
        });
    }

    function startGame(levelConfig) {
        currentLevelConfig = levelConfig;
        
        levelMenu.classList.add("hidden");
        gameArea.classList.remove("hidden");
        levelCompleteModal.classList.add("hidden");

        moves = 0;
        matches = 0;
        seconds = 0;
        movesEl.textContent = "0";
        timerEl.textContent = "00:00";
        currentLevelDisplay.textContent = levelConfig.id;

        buildGrid(levelConfig);
        
        clearInterval(gameInterval);
        gameInterval = setInterval(updateTimer, 1000);
    }

    function buildGrid(config) {
        gameGrid.innerHTML = "";
        gameGrid.className = "game-grid"; 
        gameGrid.classList.add(`grid-level-${config.id}`);

        const gameIcons = allIcons.slice(0, config.pairs);
        const deck = [...gameIcons, ...gameIcons];
        deck.sort(() => Math.random() - 0.5);

        deck.forEach(icon => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">${icon}</div>
                </div>
            `;
            
            card.dataset.icon = icon;
            card.addEventListener("click", flipCard);
            gameGrid.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains("flipped")) return;

        this.classList.add("flipped");

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesEl.textContent = moves;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        matches++;
        updateScore(10 * currentLevelConfig.id);

        // הוספת קלאס matched כדי להפעיל את הזוהר
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard = null;
        secondCard = null;

        // בדיקת ניצחון עם דיליי
        if (matches === currentLevelConfig.pairs) {
            // === התיקון כאן: השהייה של שניה לפני הצגת הניצחון ===
            setTimeout(() => {
                endLevel();
            }, 1000);
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            lockBoard = false;
            firstCard = null;
            secondCard = null;
        }, 1000);
    }

    function updateTimer() {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    }

    function endLevel() {
        clearInterval(gameInterval);

        const user = getCurrentUser();
        const currentMax = user.memoryMaxLevel || 1;
        
        if (currentLevelConfig.id >= currentMax && currentLevelConfig.id < levels.length) {
            updateUserMaxLevel(currentLevelConfig.id + 1);
        }

        document.getElementById("finishedLevelNum").textContent = currentLevelConfig.id;
        document.getElementById("finalTime").textContent = timerEl.textContent;
        document.getElementById("finalMoves").textContent = moves;

        if (currentLevelConfig.id === levels.length) {
            gameCompleteModal.classList.remove("hidden");
        } else {
            levelCompleteModal.classList.remove("hidden");
            
            nextLevelBtn.onclick = () => {
                const nextLevel = levels.find(l => l.id === currentLevelConfig.id + 1);
                startGame(nextLevel);
            };
        }
    }

    function getCurrentUser() {
        const email = localStorage.getItem("currentUserEmail");
        const users = JSON.parse(localStorage.getItem("users")) || [];
        return users.find(u => u.email === email) || {};
    }

    function updateScore(points) {
        const email = localStorage.getItem("currentUserEmail");
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.email === email);
        
        if (index !== -1) {
            users[index].score = (users[index].score || 0) + points;
            localStorage.setItem("users", JSON.stringify(users));
        }
    }

    function updateUserMaxLevel(newLevel) {
        const email = localStorage.getItem("currentUserEmail");
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.email === email);
        
        if (index !== -1) {
            users[index].memoryMaxLevel = newLevel;
            localStorage.setItem("users", JSON.stringify(users));
        }
    }
});