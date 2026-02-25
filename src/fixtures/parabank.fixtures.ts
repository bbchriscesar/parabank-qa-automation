/**
 * Custom Playwright Fixtures for the ParaBank QA Automation Framework.
 *
 * Following the official Playwright Fixtures guide:
 * https://playwright.dev/docs/test-fixtures
 *
 * This file creates a custom `test` object that extends Playwright's base test
 * with our Page Object Models and API helpers as fixtures. Tests import
 * `test` and `expect` from this file instead of from '@playwright/test'.
 *
 * This approach provides:
 * - Encapsulated setup/teardown in fixtures
 * - Reusable page objects across all test files
 * - On-demand fixture instantiation (only what the test needs)
 * - Type-safe fixture parameters
 */

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegistrationPage } from '../pages/registration.page';
import { HomePage } from '../pages/home.page';
import { AccountsOverviewPage } from '../pages/accounts-overview.page';
import { OpenAccountPage } from '../pages/open-account.page';
import { TransferFundsPage } from '../pages/transfer-funds.page';
import { BillPayPage } from '../pages/bill-pay.page';
import { ParaBankAPI } from '../api/parabank.api';

/**
 * Declare the types for all custom fixtures.
 */
type ParaBankFixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
    homePage: HomePage;
    accountsOverviewPage: AccountsOverviewPage;
    openAccountPage: OpenAccountPage;
    transferFundsPage: TransferFundsPage;
    billPayPage: BillPayPage;
    paraBankAPI: ParaBankAPI;
};

/**
 * Extend the base Playwright test with our custom fixtures.
 * Each fixture provides a page object instance tied to the current page.
 */
export const test = base.extend<ParaBankFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    registrationPage: async ({ page }, use) => {
        await use(new RegistrationPage(page));
    },

    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },

    accountsOverviewPage: async ({ page }, use) => {
        await use(new AccountsOverviewPage(page));
    },

    openAccountPage: async ({ page }, use) => {
        await use(new OpenAccountPage(page));
    },

    transferFundsPage: async ({ page }, use) => {
        await use(new TransferFundsPage(page));
    },

    billPayPage: async ({ page }, use) => {
        await use(new BillPayPage(page));
    },

    paraBankAPI: async ({ request, page }, use) => {
        await use(new ParaBankAPI(request, page));
    },
});

export { expect } from '@playwright/test';
