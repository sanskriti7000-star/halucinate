// background.js – Service Worker
// Routes popup messages to the content script via chrome.scripting / chrome.tabs.sendMessage

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "HALLUCINATE_START") {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            if (!tab) return;

            try {
                // Inject content script (idempotent – if already injected it'll just re-register)
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"],
                });

                // Send START command to content script
                chrome.tabs.sendMessage(tab.id, { action: "START" });
            } catch (err) {
                console.error("Hallucinate: injection error", err);
            }
        });
    } else if (message.action === "HALLUCINATE_STOP") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab) return;
            chrome.tabs.sendMessage(tab.id, { action: "STOP" });
        });
    }
});
