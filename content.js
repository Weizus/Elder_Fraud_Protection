/* 
This file is for page specific logic (reading/modifying DOM). This
will contain our core logic for extracting text (detecting scams).
*/

function detectEmailClient() {
    if (window.location.hostname.includes('mail.google.com')) return 'gmail';
    if (window.location.hostname.includes('outlook')) return 'outlook';
    return null;
}

function extractEmailText() {
    const client = detectEmailClient();

    if (client === 'gmail') {
        const emailBody = document.querySelector('div.a3s.aiL');
        if (emailBody) return emailBody.innerText.trim();
        return null;
    }

    if (client === 'outlook') {
        const emailBody = document.querySelector('div[class*="ReadingPaneContent"]');
        if (emailBody) return emailBody.innerText.trim();
        return null;
    }

    return null;
}

function extractText() {
    const text = document.body.innerText;
    console.log(text);
    return text;
}

function setupMutationObserver(callback) {
    let last_url = location.href;
    const observer = new MutationObserver(() => {
        if (location.href !== last_url) {
            last_url = location.href;
            callback();
        }
    });
    observer.observe(document, { childList: true, subtree: true });
    return observer;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractText') {
        const emailText = extractEmailText();

        if (emailText) {
            sendResponse({ text: emailText, source: 'email' });
        } else {
            // Fall back to full page text if no email client detected
            sendResponse({ text: extractText(), source: 'page' });
        }
    }
    return true;
});

function init() {
    console.log("Content Script Loaded");
    extractText();
    setupMutationObserver(extractText);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractText, extractEmailText, detectEmailClient, setupMutationObserver, init };
} else {
    init();
}