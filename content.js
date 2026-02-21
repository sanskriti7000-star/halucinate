/**
 * content.js – Hallucination Engine
 *
 * Applies a dream-like floating + chromatic-aberration effect to all
 * visible DOM elements. Elements drift organically within a small radius
 * of their original position and never fly off screen.
 *
 * Messages accepted:
 *   { action: "START" } – begin hallucination
 *   { action: "STOP"  } – restore original styles
 */

(() => {
    // Guard: prevent double-init if script is injected more than once
    if (window.__hallucinateRunning !== undefined) {
        // Already initialised – just listen for START/STOP
        return;
    }
    window.__hallucinateRunning = false;

    // ----- State -----
    let rafId = null;   // requestAnimationFrame handle
    let startTime = null;   // epoch ms when trip began
    let elementData = [];     // per-element animation parameters + saved styles

    // ----- Selectors to target -----
    const TARGET_SELECTOR = [
        "div", "section", "article", "aside", "header", "footer", "main", "nav",
        "p", "h1", "h2", "h3", "h4", "h5", "h6",
        "span", "a", "button", "label", "li", "ul", "ol",
        "img", "figure", "video", "input", "textarea", "select",
        "table", "tr", "td", "th",
        "form", "blockquote", "pre", "code",
    ].join(", ");

    // ----- Helpers -----
    const rand = (min, max) => Math.random() * (max - min) + min;
    const randInt = (min, max) => Math.floor(rand(min, max));

    function isVisible(el) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
    }

    // Returns true only for elements that contain direct text and benefit from
    // chromatic aberration on text-shadow.
    function hasDirectText(el) {
        for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                return true;
            }
        }
        return false;
    }

    // ----- Build element data -----
    function collectElements() {
        elementData = [];

        const all = document.querySelectorAll(TARGET_SELECTOR);

        all.forEach((el) => {
            // Skip our own injected nodes (none in this ext, but be safe)
            if (el.dataset.hallucinateSkip) return;
            if (!isVisible(el)) return;
            // Skip very large containers that cover the whole viewport
            // (e.g. body-level wrappers that, if drifted, cause scroll bars)
            const r = el.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            if (r.width > vw * 0.96 && r.height > vh * 0.8) return;

            const cs = window.getComputedStyle(el);

            elementData.push({
                el,
                // Saved original inline-style values (we only touch inline styles)
                savedTransform: el.style.transform || "",
                savedTextShadow: el.style.textShadow || "",
                savedTransition: el.style.transition || "",
                savedWillChange: el.style.willChange || "",
                savedZIndex: el.style.zIndex || "",
                savedPosition: el.style.position || "",

                // Animation parameters (unique per element)
                ampX: rand(3, 14),        // px drift on X
                ampY: rand(3, 14),        // px drift on Y
                freqX: rand(0.18, 0.45),   // Hz – horizontal oscillation
                freqY: rand(0.18, 0.45),   // Hz – vertical oscillation
                freqR: rand(0.10, 0.30),   // Hz – rotation oscillation
                ampR: rand(0.2, 1.6),     // degrees max rotation
                phaseX: rand(0, Math.PI * 2),
                phaseY: rand(0, Math.PI * 2),
                phaseR: rand(0, Math.PI * 2),

                // Chromatic aberration params (only for text nodes)
                hasChromaticAberration: hasDirectText(el),
                caAmpX: rand(1, 3),
                caAmpY: rand(0.5, 2),
                caFreq: rand(0.25, 0.55),
                caPhase: rand(0, Math.PI * 2),
            });
        });
    }

    // ----- Apply styles to prepare elements -----
    function prepareElements() {
        elementData.forEach(({ el }) => {
            // Make sure the element is in a composited layer for smooth GPU animation
            el.style.willChange = "transform";
            // Remove any existing CSS transition that could fight with rAF
            el.style.transition = "none";
        });
    }

    // ----- Animation frame -----
    function animate(timestamp) {
        if (!window.__hallucinateRunning) return;
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000; // seconds

        elementData.forEach((data) => {
            const { el, ampX, ampY, freqX, freqY, freqR, ampR,
                phaseX, phaseY, phaseR,
                hasChromaticAberration, caAmpX, caAmpY, caFreq, caPhase } = data;

            // Positional drift – sine waves ensure elements always return to origin
            const dx = Math.sin(elapsed * freqX * 2 * Math.PI + phaseX) * ampX;
            const dy = Math.cos(elapsed * freqY * 2 * Math.PI + phaseY) * ampY;
            const dr = Math.sin(elapsed * freqR * 2 * Math.PI + phaseR) * ampR;

            el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${dr.toFixed(3)}deg)`;

            // Chromatic aberration (colour-split text shadow)
            if (hasChromaticAberration) {
                const oX = Math.sin(elapsed * caFreq * 2 * Math.PI + caPhase) * caAmpX;
                const oY = Math.cos(elapsed * caFreq * 2 * Math.PI + caPhase) * caAmpY;
                el.style.textShadow =
                    `${oX.toFixed(2)}px ${oY.toFixed(2)}px 0 rgba(0,255,255,0.6), ` +
                    `${(-oX).toFixed(2)}px ${(-oY).toFixed(2)}px 0 rgba(255,0,200,0.6)`;
            }
        });

        rafId = requestAnimationFrame(animate);
    }

    // ----- Restore everything -----
    function restoreElements() {
        elementData.forEach((data) => {
            const { el, savedTransform, savedTextShadow, savedTransition, savedWillChange } = data;

            // Smooth-snap back via a short transition
            el.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), " +
                "text-shadow 0.4s ease";
            el.style.transform = savedTransform;
            el.style.textShadow = savedTextShadow;
            el.style.willChange = savedWillChange;

            // Clean up transition after snap-back
            setTimeout(() => {
                el.style.transition = savedTransition;
            }, 700);
        });
        elementData = [];
    }

    // ----- Message listener -----
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "START" && !window.__hallucinateRunning) {
            window.__hallucinateRunning = true;
            startTime = null;
            collectElements();
            prepareElements();
            rafId = requestAnimationFrame(animate);
        } else if (message.action === "STOP" && window.__hallucinateRunning) {
            window.__hallucinateRunning = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            restoreElements();
        }
    });
})();
