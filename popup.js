// popup.js – Handles button state and sends messages to background.js

const btn = document.getElementById("tripBtn");
const hint = document.getElementById("hint");

let tripping = false;

btn.addEventListener("click", () => {
    tripping = !tripping;

    if (tripping) {
        btn.querySelector(".btn-text").textContent = "Stop the Trip";
        btn.dataset.state = "on";
        hint.textContent = "Reality suspended. Hang on.";
        hint.classList.add("active");
        chrome.runtime.sendMessage({ action: "HALLUCINATE_START" });
    } else {
        btn.querySelector(".btn-text").textContent = "Start the Trip";
        btn.dataset.state = "off";
        hint.textContent = "Click to bend the fabric of the page.";
        hint.classList.remove("active");
        chrome.runtime.sendMessage({ action: "HALLUCINATE_STOP" });
    }
});
