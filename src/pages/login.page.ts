import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly registerLink: Locator;
    readonly forgotLoginLink: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('input[type="submit"][value="Log In"]');
        this.registerLink = page.locator('a[href*="register.htm"]');
        this.forgotLoginLink = page.locator('a[href*="lookup.htm"]');
        this.errorMessage = page.locator('.error');
    }

    /**
     * Navigate to the ParaBank home page (where the login form is visible).
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/index.htm');
    }

    /**
     * Login with the provided credentials.
     */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Click the Register link to navigate to the registration page.
     */
    async goToRegistration(): Promise<void> {
        await this.registerLink.click();
    }

    /**
     * Assert that the login form is visible on the page.
     */
    async expectLoginFormVisible(): Promise<void> {
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }
}
