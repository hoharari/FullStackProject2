document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("fullName").value;
    let email = document.getElementById("regEmail").value;
    let pass = document.getElementById("regPassword").value;

    // שליפת רשימת המשתמשים מה-localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // בדיקה אם המשתמש כבר קיים
    let exists = users.some(user => user.email === email);
    if (exists) {
        alert("משתמש עם המייל הזה כבר קיים!");
        return;
    }

    let newUser = {
    name: name,
    email: email,
    password: pass,

    loginCount: 0,
    lastLogin: null,

    score: 0,

    gamesPlayed: {
        memory: 0,
        stars: 0
    },

    bestScores: {
        memory: 0,
        stars: 0
    },

    achievements: []
};



    users.push(newUser);

    // שמירה חזרה ל-localStorage
    localStorage.setItem("users", JSON.stringify(users));

    alert("נרשמת בהצלחה! 🎉");
    window.location.href = "login.html";
});
