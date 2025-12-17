const icons = ["🍎","🍎","🐶","🐶","⭐","⭐","🚗","🚗"];
icons.sort(() => Math.random() - 0.5);

const game = document.getElementById("game");
const movesEl = document.getElementById("moves");

let first = null;
let second = null;
let moves = 0;

icons.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;

    card.addEventListener("click", () => {
        if (card.classList.contains("open") || second) return;

        card.classList.add("open");
        card.textContent = icon;

        if (!first) {
            first = card;
        } else {
            second = card;
            moves++;
            movesEl.textContent = moves;

            if (first.dataset.icon === second.dataset.icon) {
                first = null;
                second = null;
            } else {
                setTimeout(() => {
                    first.textContent = "";
                    second.textContent = "";
                    first.classList.remove("open");
                    second.classList.remove("open");
                    first = null;
                    second = null;
                }, 800);
            }
        }
    });

    game.appendChild(card);
});
