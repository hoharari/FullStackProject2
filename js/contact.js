document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser && emailInput) {
        emailInput.value = currentUser.email;
    }
});

document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const newMessage = {
        name,
        email,
        subject,
        message,
        date: new Date().toLocaleString()
    };

    let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];
    messages.push(newMessage);
    localStorage.setItem("contactMessages", JSON.stringify(messages));

    const successMsg = document.getElementById("successMessage");
    successMsg.textContent = "הפנייה נשלחה בהצלחה! 💜";
    successMsg.style.color = "#a77bff";

    document.getElementById("contactForm").reset();
});
