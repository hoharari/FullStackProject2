document.addEventListener("DOMContentLoaded", () => {

    // בדיקת אבטחה: האם יש משתמש מחובר?
    const currentEmail = localStorage.getItem("currentUserEmail");

    if (!currentEmail) {
        alert("אינך מחובר, מועבר לעמוד כניסה...");
        window.location.href = "login.html";
        return;
    }

    // שליפת נתונים
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === currentEmail);

    if (!user) {
        // מקרה קצה: האימייל שמור בדפדפן אבל המשתמש נמחק מהמערכת
        localStorage.removeItem("currentUserEmail");
        window.location.href = "login.html";
        return;
    }

    // עדכון ה-DOM עם פרטי המשתמש
    document.getElementById("userName").textContent = user.name || "שחקן";
    document.getElementById("visits").textContent = user.loginCount || 0;
    document.getElementById("score").textContent = user.score || 0;

    if (document.getElementById("lastLogin")) {
        document.getElementById("lastLogin").textContent = user.lastLogin || "זוהי כניסה ראשונה";
    }

    // ניהול תפריט פרופיל
    const profileToggle = document.getElementById("profileToggle");
    const profileContent = document.getElementById("profileContent");

    profileToggle.addEventListener("click", () => {
        profileContent.classList.toggle("active");
    });

    // --- לוגיקת התנתקות (Logout) ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // מחיקת ה"סשן"
            localStorage.removeItem("currentUserEmail");
            alert("התנתקת בהצלחה 👋");
            window.location.href = "index.html";
        });
    }
});