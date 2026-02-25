import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TransferFundsPage extends BasePage {
    readonly pageTitle: Locator;
    readonly amountInput: Locator;
    readonly fromAccountSelect: Locator;
    readonly toAccountSelect: Locator;
    readonly transferButton: Locator;
    readonly successMessage: Locator;
    readonly transferredAmount: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('#rightPanel h1').first();
        this.amountInput = page.locator('#amount');
        this.fromAccountSelect = page.locator('#fromAccountId');
        this.toAccountSelect = page.locator('#toAccountId');
        this.transferButton = page.locator('input[type="submit"][value="Transfer"]');
        this.successMessage = page.locator('#rightPanel h1').filter({ hasText: 'Transfer Complete!' });
        this.transferredAmount = page.locator('#amount.ng-binding, #rightPanel p span.ng-binding');
    }

    /**
     * Navigate to the Transfer Funds page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/transfer.htm');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Transfer funds between two accounts.
     * @param amount - The dollar amount to transfer
     * @param fromAccount - Source account number
     * @param toAccount - Destination account number
     */
    async transferFunds(amount: string, fromAccount: string, toAccount: string): Promise<void> {
        await this.fromAccountSelect.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000); // wait for AJAX dropdowns

        await this.amountInput.fill(amount);
        await this.fromAccountSelect.selectOption(fromAccount);
        await this.toAccountSelect.selectOption(toAccount);

        await this.transferButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Assert that the transfer was completed successfully.
     */
    async expectTransferComplete(): Promise<void> {
        await expect(this.successMessage).toHaveText('Transfer Complete!');
    }
}
