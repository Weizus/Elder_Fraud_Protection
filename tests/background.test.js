const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

afterAll(() => {
    mockConsoleLog.mockRestore();
});

describe('onInstalled listener', () => {
    test('should register an onInstalled listener', () => {
        require('../background');
        expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledTimes(1);
    });

    test('should log "Extension Installed" when fired', () => {
        require('../background');
        const listener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
        listener();
        expect(console.log).toHaveBeenCalledWith('Extension Installed');
    });
});

describe('onClicked listener', () => {
    test('should register an onClicked listener', () => {
        require('../background');
        expect(chrome.action.onClicked.addListener).toHaveBeenCalledTimes(1);
    });

    test('should call executeScript with the correct tab id', () => {
        require('../background');
        const listener = chrome.action.onClicked.addListener.mock.calls[0][0];
        listener({ id: 42 });
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: 42 },
            files: ['content.js']
        });
    });

    test('should handle a tab with an undefined id', () => {
        require('../background');
        const listener = chrome.action.onClicked.addListener.mock.calls[0][0];
        listener({ id: undefined });
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: undefined },
            files: ['content.js']
        });
    });
});