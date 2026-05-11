# Testing Guide

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or later) installed.

Then install dependencies from the project root:

```bash
npm install
```

## Running Tests

Run the full test suite:

```bash
npm test
```

This runs all test files in the `tests/` folder with verbose output.

### Run with coverage report

```bash
npm run test:coverage
```

This generates a coverage summary in the terminal and a detailed HTML report in the `coverage/` directory.

### Run a specific test file

```bash
npx jest tests/content.test.js
npx jest tests/manifest.test.js
npx jest tests/mongo.test.js
```

## Test Structure

All tests live in the `tests/` directory:

| File | What it covers |
|------|----------------|
| `content.test.js` | `extractText()`, `setupMutationObserver()`, and `init()` from `content.js` |
| `manifest.test.js` | Validates `manifest.json` structure, permissions, and file references |

## Writing New Tests

1. Create a new file in `tests/` named `<module>.test.js`.
2. If your module uses browser APIs (DOM, `document`, `window`), it will automatically run in the **jsdom** environment configured in `jest.config.js`.
3. For source files to be testable, export functions using the conditional pattern already in `content.js`:

```javascript
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { myFunction };
} else {
    myFunction();
}
```

4. Import in your test with `require()`:

```javascript
const { myFunction } = require('../myModule');
```

## CI Pipeline

Tests run automatically on every push and pull request to `main` via GitHub Actions. The workflow is defined in `.github/workflows/test.yml` and tests against Node 18.x and 20.x.
