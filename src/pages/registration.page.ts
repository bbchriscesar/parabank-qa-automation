import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { UserRegistrationData } from '../data/user.data';

export class RegistrationPage extends BasePage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly streetInput: Locator;
    readonly cityInput: Locator;
    readonly stateInput: Locator;
    readonly zipCodeInput: Locator;
    readonly phoneInput: Locator;
    readonly ssnInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly registerButton: Locator;

    // Success / Error messages
    readonly successTitle: Locator;
    readonly successMessage: Locator;
    readonly errorMessages: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('#customer\\.firstName');
        this.lastNameInput = page.locator('#customer\\.lastName');
        this.streetInput = page.locator('#customer\\.address\\.street');
        this.cityInput = page.locator('#customer\\.address\\.city');
        this.stateInput = page.locator('#customer\\.address\\.state');
        this.zipCodeInput = page.locator('#customer\\.address\\.zipCode');
        this.phoneInput = page.locator('#customer\\.phoneNumber');
        this.ssnInput = page.locator('#customer\\.ssn');
        this.usernameInput = page.locator('#customer\\.username');
        this.passwordInput = page.locator('#customer\\.password');
        this.confirmPasswordInput = page.locator('#repeatedPassword');
        this.registerButton = page.locator('input[type="submit"][value="Register"]');

        this.successTitle = page.locator('#rightPanel h1');
        this.successMessage = page.locator('#rightPanel p');
        this.errorMessages = page.locator('.error');
    }

    /**
     * Navigate to the registration page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/register.htm');
    }

    /**
     * Fill out the entire registration form with the provided user data.
     */
    async fillRegistrationForm(user: UserRegistrationData): Promise<void> {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.streetInput.fill(user.street);
        await this.cityInput.fill(user.city);
        await this.stateInput.fill(user.state);
        await this.zipCodeInput.fill(user.zipCode);
        await this.phoneInput.fill(user.phoneNumber);
        await this.ssnInput.fill(user.ssn);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
    }

    /**
     * Submit the registration form.
     */
    async submitRegistration(): Promise<void> {
        await this.registerButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Complete registration flow: fill form + submit.
     */
    async registerUser(user: UserRegistrationData): Promise<void> {
        await this.fillRegistrationForm(user);
        await this.submitRegistration();
    }

    /**
     * Assert that registration was successful.
     */
    async expectRegistrationSuccess(username: string): Promise<void> {
        await expect(this.successTitle).toHaveText('Welcome ' + username);
        await expect(this.successMessage).toContainText('Your account was created successfully');
    }
}
