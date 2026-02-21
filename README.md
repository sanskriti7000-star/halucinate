# 🌀 Hallucinate

> *"Reality is optional."*

A Chrome Extension (Manifest V3) that makes the entire web dream. Activate it on any page and watch every visible element float, drift, and blur into a fluid, psychedelic hallucination — then snap cleanly back to reality when you're done.

---

## ✨ Features

- **Organic floating** — every element drifts independently using randomised sine-wave oscillations, always returning to its original position.
- **Chromatic aberration** — text elements get a colour-split shadow (cyan / magenta) that pulses in sync with the drift.
- **GPU-accelerated** — runs on `requestAnimationFrame` with `will-change: transform` for smooth, jank-free animation.
- **Non-destructive** — only inline styles are touched; all original styles are fully restored when the effect is stopped.
- **One-click toggle** — start and stop the trip from the extension popup.

---

## 📂 Project Structure

```
halucinate/
├── manifest.json     # Extension manifest (MV3)
├── background.js     # Service worker – message relay between popup and content
├── content.js        # Hallucination Engine – animation logic injected into pages
├── popup.html        # Extension popup UI
├── popup.css         # Popup styling
├── popup.js          # Popup logic – sends START / STOP messages
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🚀 Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `halucinate/` folder.
5. The **Hallucinate** extension icon will appear in your toolbar.

---

## 🎮 Usage

1. Navigate to any webpage.
2. Click the **Hallucinate** extension icon.
3. Hit **"Start the Trip"** — the page will begin to float and distort.
4. Click **"End the Trip"** to smoothly restore everything back to normal.

---

## ⚙️ How It Works

| File | Role |
|---|---|
| `content.js` | Queries all visible DOM elements, assigns unique randomised animation parameters (amplitude, frequency, phase), and drives them with `requestAnimationFrame`. Text nodes also receive animated chromatic-aberration `text-shadow`. |
| `background.js` | Service worker that relays `START` / `STOP` messages from the popup to the active tab's content script via `chrome.tabs.sendMessage`. |
| `popup.js` | Listens for the button click and sends the appropriate action message through `background.js`. |

### Animation model

Each element gets its own set of randomised parameters:

- **`ampX` / `ampY`** (3–14 px) — drift radius on each axis
- **`freqX` / `freqY`** (0.18–0.45 Hz) — oscillation speed
- **`ampR`** (0.2–1.6°) — subtle rotation amount
- **`caAmpX` / `caAmpY`** — chromatic aberration colour-split offset (text elements only)

Position is computed every frame as:

```
dx = sin(t × freqX × 2π + phaseX) × ampX
dy = cos(t × freqY × 2π + phaseY) × ampY
dr = sin(t × freqR × 2π + phaseR) × ampR
```

Because sine/cosine always return to zero, elements always drift back to their origin — no element ever flies off screen.

---

## 🛠️ Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Required to inject the content script into the current page |
| `scripting` | Required to programmatically execute `content.js` |

---

## 📄 License

MIT — do whatever you want with it.
