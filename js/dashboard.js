document.addEventListener("DOMContentLoaded", () => {

    // אימייל של המשתמש המחובר
    const currentEmail = localStorage.getItem("currentUserEmail");

    if (!currentEmail) {
        alert("אין משתמש מחובר");
        window.location.href = "login.html";
        return;
    }

    // כל המשתמשים
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // מציאת המשתמש הנוכחי
    const user = users.find(u => u.email === currentEmail);

    if (!user) {
        alert("משתמש לא נמצא");
        return;
    }

    // הצגת נתונים אמיתיים
    document.getElementById("userName").textContent = user.name || "שחקן";
    document.getElementById("visits").textContent = user.loginCount || 0;
    document.getElementById("score").textContent = user.score || 0;

    if (document.getElementById("lastLogin")) {
        document.getElementById("lastLogin").textContent =
            user.lastLogin || "לא זמין";
    }

    // פתיחה / סגירה של הפרופיל
    const profileToggle = document.getElementById("profileToggle");
    const profileContent = document.getElementById("profileContent");

    profileToggle.addEventListener("click", () => {
        profileContent.classList.toggle("active");
    });
});
