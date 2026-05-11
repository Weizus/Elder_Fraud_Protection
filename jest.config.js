module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['tests/e2e.test.js'],
  collectCoverageFrom: [
    '*.js',
    'popup/*.js',
    '!jest.config.js',
    '!node_modules/**'
  ],
    setupFiles: ['./tests/mocks/chrome.js']
};
