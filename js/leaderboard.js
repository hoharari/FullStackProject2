document.addEventListener("DOMContentLoaded", () => {
    // מציאת הכפתור הראשון (כללי) כדי לסמן אותו כפעיל בטעינה
    const defaultBtn = document.querySelector('.filter-btn');
    
    // טעינת ברירת המחדל (הכל) ושליחת הכפתור
    showLeaderboard('all', defaultBtn);
});

function showLeaderboard(type, btnElement) {
    const rankingBody = document.getElementById("rankingBody");
    rankingBody.innerHTML = ""; // ניקוי הטבלה

    // === עדכון כפתורים פעילים ===
    // קודם כל מנקים את הסימון מכל הכפתורים
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    // אם התקבל אלמנט כפתור (בלחיצה או בטעינה), מסמנים אותו
    if (btnElement) {
        btnElement.classList.add('active');
    }
    
    // === שליפת המשתמשים ===
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUserEmail = localStorage.getItem("currentUserEmail");

    // === מיון לפי הסוג הנבחר ===
    users.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        
        if (type === 'all') {
            scoreA = a.score || 0;
            scoreB = b.score || 0;
        } else if (type === 'memory') {
            scoreA = a.memoryScore || 0;
            scoreB = b.memoryScore || 0;
        } else if (type === 'catcher') {
            scoreA = a.catcherScore || 0;
            scoreB = b.catcherScore || 0;
        }
        
        return scoreB - scoreA; // מהגבוה לנמוך
    });

    // === בדיקה אם יש נתונים ===
    if (users.length === 0) {
        rankingBody.innerHTML = "<tr><td colspan='4'>טרם נרשמו שחקנים</td></tr>";
        return;
    }

    // === יצירת הטבלה ===
    users.forEach((user, index) => {
        // קביעת הניקוד להצגה לפי הסוג שנבחר
        let displayScore = 0;
        if (type === 'all') displayScore = user.score || 0;
        if (type === 'memory') displayScore = user.memoryScore || 0;
        if (type === 'catcher') displayScore = user.catcherScore || 0;

        // אם לשחקן אין ניקוד במשחק הספציפי הזה, אולי נרצה לדלג עליו?
        // כרגע נציג אותו עם 0, או שאפשר להוסיף תנאי:
        // if (displayScore === 0 && type !== 'all') return;

        const rank = index + 1;
        const row = document.createElement("tr");

        if (user.email === currentUserEmail) row.classList.add("current-user");
        if (rank <= 3) row.classList.add(`rank-${rank}`);

        let rankDisplay = rank;
        if (rank === 1) rankDisplay = "🥇 1";
        if (rank === 2) rankDisplay = "🥈 2";
        if (rank === 3) rankDisplay = "🥉 3";

        // חישוב דרגה לפי הניקוד המוצג
        let level = "טירון";
        if (displayScore > 50) level = "מתקדם";
        if (displayScore > 150) level = "מקצוען";
        if (displayScore > 300) level = "מאסטר";
        if (displayScore > 500) level = "אגדה 🔥";

        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${user.name}</td>
            <td>${displayScore}</td>
            <td><span class="badge">${level}</span></td>
        `;

        rankingBody.appendChild(row);
    });
}