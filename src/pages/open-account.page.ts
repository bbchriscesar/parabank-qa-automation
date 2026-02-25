import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class OpenAccountPage extends BasePage {
    readonly pageTitle: Locator;
    readonly accountTypeSelect: Locator;
    readonly fromAccountSelect: Locator;
    readonly openAccountButton: Locator;
    readonly newAccountId: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('#rightPanel h1');
        this.accountTypeSelect = page.locator('#type');
        this.fromAccountSelect = page.locator('#fromAccountId');
        this.openAccountButton = page.locator('input[type="button"][value="Open New Account"]');
        this.newAccountId = page.locator('#newAccountId');
        this.successMessage = page.locator('#rightPanel h1').filter({ hasText: 'Account Opened!' });
    }

    /**
     * Navigate to the Open New Account page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/openaccount.htm');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Open a new Savings account and return the new account number.
     */
    async openSavingsAccount(): Promise<string> {
        // Wait for the form to fully load (account dropdown populates via AJAX)
        await this.fromAccountSelect.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000); // wait for AJAX to populate dropdowns

        // Select SAVINGS account type (value = 1)
        await this.accountTypeSelect.selectOption('1');
        await this.page.waitForTimeout(500);

        // Click "Open New Account"
        await this.openAccountButton.click();
        await this.page.waitForLoadState('networkidle');

        // Capture and return the new account number
        await this.newAccountId.waitFor({ state: 'visible' });
        const accountNumber = await this.newAccountId.textContent();
        return accountNumber?.trim() || '';
    }

    /**
     * Open a new Checking account and return the new account number.
     */
    async openCheckingAccount(): Promise<string> {
        await this.fromAccountSelect.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000);

        // Select CHECKING account type (value = 0)
        await this.accountTypeSelect.selectOption('0');
        await this.page.waitForTimeout(500);

        await this.openAccountButton.click();
        await this.page.waitForLoadState('networkidle');

        await this.newAccountId.waitFor({ state: 'visible' });
        const accountNumber = await this.newAccountId.textContent();
        return accountNumber?.trim() || '';
    }

    /**
     * Assert that the account was opened successfully.
     */
    async expectAccountOpened(): Promise<void> {
        await expect(this.successMessage).toHaveText('Account Opened!');
        await expect(this.newAccountId).toBeVisible();
    }
}
