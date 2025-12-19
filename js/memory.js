document.addEventListener("DOMContentLoaded", () => {
    // מערך האייקונים (כפול כי צריך זוגות)
    const icons = ["🚀", "🚀", "🎮", "🎮", "👻", "👻", "💎", "💎", "🦄", "🦄", "🍕", "🍕", "🎸", "🎸", "🐱", "🐱"];
    
    // ערבוב הקלפים
    icons.sort(() => Math.random() - 0.5);

    const grid = document.getElementById("game-grid");
    const movesEl = document.getElementById("moves");
    const timerEl = document.getElementById("timer");
    const matchesEl = document.getElementById("matches");
    
    // אלמנטים למודל סיום
    const modal = document.getElementById("gameOverModal");
    const finalTimeEl = document.getElementById("finalTime");
    const finalMovesEl = document.getElementById("finalMoves");

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false; // מונע לחיצות בזמן בדיקה
    let moves = 0;
    let matches = 0;
    
    // משתני זמן
    let timeSeconds = 0;
    let timerInterval;
    let gameStarted = false;

    // יצירת הקלפים על הלוח
    icons.forEach(icon => {
        // יצירת מבנה HTML עבור אפקט ההיפוך
        const card = document.createElement("div");
        card.classList.add("card");
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${icon}</div>
            </div>
        `;

        // הוספת האזנה ללחיצה
        card.addEventListener("click", () => flipCard(card, icon));
        grid.appendChild(card);
    });

    function startTimer() {
        if (gameStarted) return;
        gameStarted = true;
        timerInterval = setInterval(() => {
            timeSeconds++;
            const mins = Math.floor(timeSeconds / 60).toString().padStart(2, '0');
            const secs = (timeSeconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function flipCard(card, icon) {
        if (lockBoard) return; // הלוח נעול
        if (card === firstCard) return; // לא ללחוץ על אותו קלף פעמיים
        if (card.classList.contains("flipped")) return; // קלף כבר הפוך

        // התחלת טיימר בלחיצה הראשונה
        startTimer();

        // ביצוע ההיפוך ויזואלית
        card.classList.add("flipped");

        if (!firstCard) {
            // קלף ראשון
            firstCard = card;
            firstCard.dataset.icon = icon;
            return;
        }

        // קלף שני
        secondCard = card;
        secondCard.dataset.icon = icon;
        
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
        // סימון התאמה
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matches++;
        matchesEl.textContent = matches;

        // עדכון ניקוד ב-LocalStorage
        updateScore(10);

        resetBoard();

        // בדיקת ניצחון
        if (matches === icons.length / 2) {
            endGame();
        }
    }

    function unflipCards() {
        lockBoard = true; // נועלים את הלוח כדי שהמשתמש לא ילחץ על עוד קלפים
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetBoard();
        }, 1000); // מחכים שנייה ואז הופכים חזרה
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function endGame() {
        clearInterval(timerInterval);
        
        setTimeout(() => {
            finalTimeEl.textContent = timerEl.textContent;
            finalMovesEl.textContent = moves;
            modal.classList.remove("hidden");
        }, 500);
    }

    // פונקציה לעדכון ניקוד (כמו בדאשבורד)
    function updateScore(points) {
        const currentEmail = localStorage.getItem("currentUserEmail");
        if (!currentEmail) return;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(u => u.email === currentEmail);

        if (userIndex !== -1) {
            users[userIndex].score = (users[userIndex].score || 0) + points;
            
            if (!users[userIndex].gamesPlayed) users[userIndex].gamesPlayed = {};
            users[userIndex].gamesPlayed.memory = (users[userIndex].gamesPlayed.memory || 0) + 1;

            localStorage.setItem("users", JSON.stringify(users));
        }
    }
});