const { extractText } = require('../content');

global.fetch = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Set up the popup's HTML so popup.js has the DOM elements it needs
    document.body.innerHTML = `
        <div class="popup-container">
            <div class="status-dot"></div>
            <input type="checkbox" id="autoScanToggle">
            <button id="scanButton">Scan Page</button>
        </div>
    `;
});

describe('popup and content.js message passing', () => {

    test('popup displays text returned by content.js when scan button is clicked', async () => {
        // Simulate content.js responding with page text
        document.body.innerText = 'Hello from the page';
        const pageText = extractText();

        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ id: 1 }]);
        });

        chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
            if (message.action === 'extractText') {
                callback({ text: pageText });
            }
        });

        require('../popup/popup');

        global.fetch.mockResolvedValueOnce({
        json: async () => ({ 
            pred_label: 'legitimate',
            pred_score: 95
            })
        });


        document.getElementById('scanButton').click();

        await new Promise(resolve => setTimeout(resolve, 100));


        const results = document.getElementById('results');
        expect(results).not.toBeNull();
        //expect(results.textContent).toBe(pageText.trim().slice(0, 1000));
        expect(results.textContent).toContain('Result:')
    });

    test('popup handles error gracefully when content.js fails to respond', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ id: 1 }]);
        });

        chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
            // Simulate a failure — no response and lastError is set
            chrome.runtime.lastError = { message: 'Could not establish connection' };
            callback(null);
            chrome.runtime.lastError = null;
        });

        require('../popup/popup');

        document.getElementById('scanButton').click();

        // Popup should not crash and results should not be rendered
        const results = document.getElementById('results');
        expect(results).toBeNull();
    });

});