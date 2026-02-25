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

### 3. Setup environment variables

Create a `.env` file from the provided example. The following command works across different Operating Systems (Windows, macOS, Linux):

```bash
node -e "fs.copyFileSync('.env.example', '.env')"
```

### 4. Install Playwright Chrome browser

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

Tests are automatically executed via GitHub Actions on **every single commit/push** to the repository. The workflow runs the full E2E setup combining both the UI and API validation phases.

### Email Reports

After execution, the CI matrix parses the test results and sends an email report detailing:
- Total tests executed
- Number of passed and failed tests
- A direct link to the logs and screenshots of failures
- A summary of any flaky or retried tests

**To activate this feature**, make sure to configure the corresponding Repository Secrets in your GitHub repo settings (`Settings` > `Secrets and variables` > `Actions`):

- `SMTP_SERVER`: e.g. `smtp.gmail.com`
- `SMTP_PORT`: e.g. `465` or `587`
- `SMTP_USERNAME`: Your SMTP username/email
- `SMTP_PASSWORD`: Your SMTP app password
- `EMAIL_RECIPIENT`: The email address to send the report to

_Note: If secrets are omitted, the email step may fail, but the execution artifacts (logs, HTML report) will still be saved._ The HTML report is uploaded as an artifact and retained for 30 days.

---

## Browser

This project is configured to run exclusively on **Google Chrome** across all platforms (Linux, macOS, Windows).
