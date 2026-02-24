# Parabank QA Automation

Automated end-to-end test suite for the Parabank application using [Playwright](https://playwright.dev/).

---

## Prerequisites

Before running the tests, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Google Chrome](https://www.google.com/chrome/) (required — tests run on Chrome)
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/parabank-qa-automation.git
cd parabank-qa-automation
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright Chrome browser

```bash
npx playwright install chrome --with-deps
```

---

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run tests in headed mode (visible browser)

```bash
npx playwright test --headed
```

### Run a specific test file

```bash
npx playwright test tests/<filename>.spec.ts
```

### View the HTML report after a test run

```bash
npx playwright show-report
```

---

## Project Structure

```
parabank-qa-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml     # CI pipeline (GitHub Actions)
├── tests/                     # All test spec files
├── playwright.config.ts       # Playwright configuration
├── package.json
└── README.md
```

---

## CI / GitHub Actions

Tests are automatically executed via GitHub Actions on every push or pull request to the `main` branch. The HTML report is uploaded as an artifact and retained for **30 days**.

---

## Browser

This project is configured to run exclusively on **Google Chrome** across all platforms (Linux, macOS, Windows).
