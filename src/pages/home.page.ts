import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
    // --- Welcome Section ---
    readonly welcomeMessage: Locator;

    // --- Authenticated Left Panel Navigation ---
    readonly openNewAccountLink: Locator;
    readonly accountsOverviewLink: Locator;
    readonly transferFundsLink: Locator;
    readonly billPayLink: Locator;
    readonly findTransactionsLink: Locator;
    readonly updateContactInfoLink: Locator;
    readonly requestLoanLink: Locator;
    readonly logOutLink: Locator;

    constructor(page: Page) {
        super(page);

        this.welcomeMessage = page.locator('#leftPanel .smallText');

        // Authenticated navigation menu items
        this.openNewAccountLink = page.locator('a[href*="openaccount.htm"]');
        this.accountsOverviewLink = page.locator('a[href*="overview.htm"]');
        this.transferFundsLink = page.locator('a[href*="transfer.htm"]');
        this.billPayLink = page.locator('a[href*="billpay.htm"]');
        this.findTransactionsLink = page.locator('a[href*="findtrans.htm"]');
        this.updateContactInfoLink = page.locator('a[href*="updateprofile.htm"]');
        this.requestLoanLink = page.locator('a[href*="requestloan.htm"]');
        this.logOutLink = page.locator('a[href*="logout.htm"]');
    }

    /**
     * Navigate to the home page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/index.htm');
    }

    /**
     * Assert the user is logged in by checking the welcome message visibility.
     */
    async expectLoggedIn(): Promise<void> {
        await expect(this.welcomeMessage).toBeVisible();
    }

    /**
     * Assert all global navigation menu links are visible and functional.
     */
    async expectNavigationMenuVisible(): Promise<void> {
        await expect(this.openNewAccountLink).toBeVisible();
        await expect(this.accountsOverviewLink).toBeVisible();
        await expect(this.transferFundsLink).toBeVisible();
        await expect(this.billPayLink).toBeVisible();
        await expect(this.findTransactionsLink).toBeVisible();
        await expect(this.updateContactInfoLink).toBeVisible();
        await expect(this.requestLoanLink).toBeVisible();
        await expect(this.logOutLink).toBeVisible();
    }

    /**
     * Verify navigation by clicking each menu link and asserting the expected page loads.
     * Returns to the overview page after each check.
     */
    async verifyNavigationLinks(): Promise<void> {
        const navLinks = [
            { locator: this.openNewAccountLink, expectedUrl: /openaccount/ },
            { locator: this.accountsOverviewLink, expectedUrl: /overview/ },
            { locator: this.transferFundsLink, expectedUrl: /transfer/ },
            { locator: this.billPayLink, expectedUrl: /billpay/ },
            { locator: this.findTransactionsLink, expectedUrl: /findtrans/ },
            { locator: this.updateContactInfoLink, expectedUrl: /updateprofile/ },
            { locator: this.requestLoanLink, expectedUrl: /requestloan/ },
        ];

        for (const link of navLinks) {
            await link.locator.click();
            await this.page.waitForLoadState('networkidle');
            await expect(this.page).toHaveURL(link.expectedUrl);
        }
    }

    /**
     * Navigate to Open New Account page.
     */
    async goToOpenNewAccount(): Promise<void> {
        await this.openNewAccountLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Navigate to Accounts Overview page.
     */
    async goToAccountsOverview(): Promise<void> {
        await this.accountsOverviewLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Navigate to Transfer Funds page.
     */
    async goToTransferFunds(): Promise<void> {
        await this.transferFundsLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Navigate to Bill Pay page.
     */
    async goToBillPay(): Promise<void> {
        await this.billPayLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Log out the current user.
     */
    async logout(): Promise<void> {
        await this.logOutLink.click();
        await this.page.waitForLoadState('networkidle');
    }
}
