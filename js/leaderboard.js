document.addEventListener("DOMContentLoaded", () => {
    const rankingBody = document.getElementById("rankingBody");
    
    // שליפת המשתמשים
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUserEmail = localStorage.getItem("currentUserEmail");

    // מיון המערך לפי ניקוד (מהגבוה לנמוך)
    users.sort((a, b) => (b.score || 0) - (a.score || 0));

    // אם אין משתמשים בכלל
    if (users.length === 0) {
        rankingBody.innerHTML = "<tr><td colspan='4'>טרם נרשמו שחקנים</td></tr>";
        return;
    }

    // יצירת השורות בטבלה
    users.forEach((user, index) => {
        const rank = index + 1;
        const row = document.createElement("tr");

        // הדגשת המשתמש הנוכחי
        if (user.email === currentUserEmail) {
            row.classList.add("current-user");
        }

        // הוספת קלאס מיוחד ל-3 הראשונים
        if (rank <= 3) {
            row.classList.add(`rank-${rank}`);
        }

        // קביעת אייקון למקום
        let rankDisplay = rank;
        if (rank === 1) rankDisplay = "🥇 1";
        if (rank === 2) rankDisplay = "🥈 2";
        if (rank === 3) rankDisplay = "🥉 3";

        // חישוב דרגה לפי ניקוד
        let level = "טירון";
        let score = user.score || 0;
        
        if (score > 50) level = "מתקדם";
        if (score > 150) level = "מקצוען";
        if (score > 300) level = "מאסטר";
        if (score > 500) level = "אגדה 🔥";

        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${user.name}</td>
            <td>${score}</td>
            <td><span class="badge">${level}</span></td>
        `;

        rankingBody.appendChild(row);
    });
});