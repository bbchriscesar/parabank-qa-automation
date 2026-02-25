const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../test-results.json');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const outputPath = path.join(__dirname, '../email_body.txt');

const repo = process.env.GITHUB_REPOSITORY || 'unknown-repo';
const runId = process.env.GITHUB_RUN_ID || 'unknown-run-id';
const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;
const artifactUrl = `${runUrl}#artifacts`;

/**
 * Recursively collects all tests from nested suites.
 */
function collectTests(suites) {
    const tests = [];
    for (const suite of suites) {
        for (const test of suite.tests || []) {
            tests.push(test);
        }
        if (suite.suites) {
            tests.push(...collectTests(suite.suites));
        }
    }
    return tests;
}

async function main() {
    try {
        const rawData = fs.readFileSync(resultsPath);
        const results = JSON.parse(rawData);

        const stats = results.stats || {};
        const total = (stats.expected || 0) + (stats.unexpected || 0) + (stats.flaky || 0) + (stats.skipped || 0);
        const passed = stats.expected || 0;
        const failed = stats.unexpected || 0;
        const flaky = stats.flaky || 0;
        const skipped = stats.skipped || 0;

        let body = `Playwright UI + API Test Execution Report\n`;
        body += `=========================================\n\n`;
        body += `Total tests executed: ${total}\n`;
        body += `Passed tests: ${passed}\n`;
        body += `Failed tests: ${failed}\n`;
        body += `Flaky tests: ${flaky}\n`;
        body += `Skipped tests: ${skipped}\n\n`;

        const allTests = collectTests(results.suites || []);

        // --- Failed Tests with screenshots/logs ---
        if (failed > 0) {
            body += `FAILED TESTS DETAILS\n`;
            body += `--------------------\n`;

            for (const test of allTests) {
                const failedResults = test.results.filter(r => r.status === 'failed' || r.status === 'timedOut');
                if (failedResults.length === 0) continue;

                body += `\n❌ ${test.title}\n`;

                for (const result of failedResults) {
                    // Include error message
                    if (result.error && result.error.message) {
                        const errorMsg = result.error.message.split('\n').slice(0, 3).join('\n');
                        body += `   Error: ${errorMsg}\n`;
                    }

                    // Include links to screenshots and logs (attachments)
                    const attachments = result.attachments || [];
                    if (attachments.length > 0) {
                        body += `   Attachments:\n`;
                        for (const att of attachments) {
                            const attPath = att.path || att.body || 'N/A';
                            body += `   - ${att.name} (${att.contentType}): ${attPath}\n`;
                        }
                    }
                }
            }

            body += `\nFull logs, screenshots, and traces are available in the CI artifacts:\n`;
            body += `${artifactUrl}\n`;
        } else {
            body += `✅ All tests passed successfully!\n`;
        }

        // --- Summary of retries or flaky tests ---
        const retriedTests = allTests.filter(t => t.results && t.results.length > 1);
        const flakyTests = allTests.filter(t => t.status === 'flaky');

        if (retriedTests.length > 0 || flakyTests.length > 0) {
            body += `\nRETRIES & FLAKY TESTS SUMMARY\n`;
            body += `-----------------------------\n`;

            for (const test of retriedTests) {
                const attempts = test.results.length;
                const finalStatus = test.results[test.results.length - 1].status;
                const isFlaky = flakyTests.includes(test);
                const label = isFlaky ? '⚠️  FLAKY' : (finalStatus === 'passed' ? '🔄 RETRIED (passed)' : '❌ RETRIED (failed)');
                body += `${label} ${test.title} — ${attempts} attempt(s)\n`;

                for (let i = 0; i < test.results.length; i++) {
                    const r = test.results[i];
                    const duration = (r.duration / 1000).toFixed(1);
                    body += `   Attempt ${i + 1}: ${r.status} (${duration}s)\n`;
                }
            }
        } else {
            body += `\nNo retries or flaky tests detected.\n`;
        }

        body += `\nView the full GitHub Actions Run: ${runUrl}\n`;

        fs.writeFileSync(outputPath, body);
        console.log(`Email body generated at ${outputPath}`);

        console.log('Sending email via Resend...');
        try {
            const data = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: process.env.EMAIL_RECIPIENT,
                subject: 'Playwright E2E UI + API Test Results',
                text: body,
            });
            console.log('Email sent successfully via Resend!', data);
        } catch (sendErr) {
            console.log('Failed to send email via Resend:', sendErr);
        }

    } catch (e) {
        console.error(`Failed to generate email report: ${e}`);
        fs.writeFileSync(outputPath, `Failed to generate email report. Error: ${e.message}\nView the GitHub Actions Run here: ${runUrl}`);
    }
}

main();
