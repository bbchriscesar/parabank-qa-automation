import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountsOverviewPage extends BasePage {
    readonly pageTitle: Locator;
    readonly accountsTable: Locator;
    readonly accountRows: Locator;
    readonly totalBalance: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('#rightPanel h1').first();
        this.accountsTable = page.locator('#accountTable');
        this.accountRows = page.locator('#accountTable tbody tr');
        this.totalBalance = page.locator('#accountTable tbody tr').filter({ hasText: 'Total' }).locator('td').nth(1);
    }

    /**
     * Navigate to the Accounts Overview page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/overview.htm');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Assert the page title is "Accounts Overview".
     */
    async expectPageTitle(): Promise<void> {
        await expect(this.pageTitle).toHaveText('Accounts Overview');
    }

    /**
     * Assert the accounts table is visible on the page.
     */
    async expectAccountsTableVisible(): Promise<void> {
        await expect(this.accountsTable).toBeVisible();
    }

    /**
     * Get the number of account rows displayed.
     */
    async getAccountCount(): Promise<number> {
        // Exclude the footer/total row
        return await this.page.locator('#accountTable tbody tr td a').count();
    }

    /**
     * Get the account number from a specific row (0-indexed).
     */
    async getAccountNumber(rowIndex: number): Promise<string> {
        const accountLink = this.page.locator('#accountTable tbody tr td a').nth(rowIndex);
        return (await accountLink.textContent()) || '';
    }

    /**
     * Get the balance for a specific account row (0-indexed).
     */
    async getAccountBalance(rowIndex: number): Promise<string> {
        const balanceCell = this.accountRows.nth(rowIndex).locator('td:nth-child(2)');
        return (await balanceCell.textContent()) || '';
    }

    /**
     * Assert that a specific account number is displayed in the overview.
     */
    async expectAccountExists(accountNumber: string): Promise<void> {
        const accountLink = this.page.locator(`#accountTable a:has-text("${accountNumber}")`);
        await expect(accountLink).toBeVisible();
    }

    /**
     * Assert the total balance is displayed.
     */
    async expectTotalBalanceVisible(): Promise<void> {
        await expect(this.totalBalance).toBeVisible();
    }

    /**
     * Assert balance details are displayed as expected (table has data).
     */
    async expectBalanceDetailsDisplayed(): Promise<void> {
        await this.expectAccountsTableVisible();
        const count = await this.getAccountCount();
        expect(count).toBeGreaterThan(0);
        await this.expectTotalBalanceVisible();
    }
}
