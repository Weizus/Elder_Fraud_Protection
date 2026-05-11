global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
     onInstalled: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    lastError: null
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  scripting: {
    executeScript: jest.fn()
  },
  action: {
    onClicked: {
      addListener: jest.fn()
    }
  }
};