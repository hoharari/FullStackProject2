/**
 * קובץ: js/login.js
 * תיאור: מנהל את תהליך ההתחברות.
 * כולל אימות מול Local Storage, בדיקת חסימות (Security) וניהול Session.
 */

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    // חיפוש המשתמש לפי מייל בלבד בהתחלה
    let user = users.find(u => u.email === email);

    // 1. בדיקה אם המשתמש בכלל קיים
    if (!user) {
        alert("משתמש לא נמצא במערכת ❌\nנא להירשם תחילה.");
        return;
    }

    // 2. בדיקה אם המשתמש חסום (Security Requirement)
    if (user.isBlocked) {
        let blockTime = new Date(user.blockReleaseTime);
        let now = new Date();

        if (now < blockTime) {
            // עדיין חסום
            alert(`החשבון חסום עקב ריבוי ניסיונות.\nנסה שוב בשעה: ${blockTime.toLocaleTimeString()}`);
            return;
        } else {
            // שחרור חסימה אוטומטי
            user.isBlocked = false;
            user.loginAttempts = 0;
            saveUsers(users); 
        }
    }

    // 3. אימות סיסמה
    if (user.password === pass) {
        // --- הצלחה ---
        user.loginAttempts = 0; // איפוס מונה טעויות
        user.loginCount = (user.loginCount || 0) + 1;
        user.lastLogin = new Date().toLocaleString();
        
        saveUsers(users); // שמירת העדכונים
        
        // יצירת Session (שמירת המשתמש המחובר)
        localStorage.setItem("currentUserEmail", user.email);

        alert("התחברת בהצלחה! 🎮\nמעביר אותך למשחקים...");
        window.location.href = "dashboard.html";

    } else {
        // --- כישלון (סיסמה שגויה) ---
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        if (user.loginAttempts >= 3) {
            // חסימה!
            user.isBlocked = true;
            let releaseTime = new Date();
            releaseTime.setMinutes(releaseTime.getMinutes() + 5); // חסימה ל-5 דקות
            user.blockReleaseTime = releaseTime;
            
            saveUsers(users);
            alert("הקשת סיסמה שגויה 3 פעמים.\nהחשבון ננעל ל-5 דקות! 🔒");
        } else {
            // התראה רגילה
            saveUsers(users);
            alert(`סיסמה שגויה ❌\nנותרו לך ${3 - user.loginAttempts} ניסיונות לפני חסימה.`);
        }
    }
});

// פונקציית עזר לשמירה ב-LocalStorage
function saveUsers(usersArray) {
    localStorage.setItem("users", JSON.stringify(usersArray));
}