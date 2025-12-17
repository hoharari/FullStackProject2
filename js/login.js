document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email && u.password === pass);

    if (!user) {
        alert("פרטים לא נכונים ❌");
        return;
    }

    // עדכון פרטי פעילות
    user.loginCount++;
    user.lastLogin = new Date().toLocaleString();

    // עדכון ברשימת המשתמשים
    localStorage.setItem("users", JSON.stringify(users));

    // שמירת המשתמש המחובר — נשמור רק את האימייל!
    localStorage.setItem("currentUserEmail", user.email);

    alert("התחברת בהצלחה 🎮");
    window.location.href = "dashboard.html";
});
