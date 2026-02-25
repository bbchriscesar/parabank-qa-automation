import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface BillPayeeInfo {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    accountNumber: string;
    amount: string;
}

export class BillPayPage extends BasePage {
    readonly pageTitle: Locator;
    readonly payeeNameInput: Locator;
    readonly payeeStreetInput: Locator;
    readonly payeeCityInput: Locator;
    readonly payeeStateInput: Locator;
    readonly payeeZipCodeInput: Locator;
    readonly payeePhoneInput: Locator;
    readonly payeeAccountInput: Locator;
    readonly verifyAccountInput: Locator;
    readonly amountInput: Locator;
    readonly fromAccountSelect: Locator;
    readonly sendPaymentButton: Locator;
    readonly successMessage: Locator;
    readonly payeeName: Locator;
    readonly paymentAmount: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('#rightPanel h1').first();
        this.payeeNameInput = page.locator('input[name="payee.name"]');
        this.payeeStreetInput = page.locator('input[name="payee.address.street"]');
        this.payeeCityInput = page.locator('input[name="payee.address.city"]');
        this.payeeStateInput = page.locator('input[name="payee.address.state"]');
        this.payeeZipCodeInput = page.locator('input[name="payee.address.zipCode"]');
        this.payeePhoneInput = page.locator('input[name="payee.phoneNumber"]');
        this.payeeAccountInput = page.locator('input[name="payee.accountNumber"]');
        this.verifyAccountInput = page.locator('input[name="verifyAccount"]');
        this.amountInput = page.locator('input[name="amount"]');
        this.fromAccountSelect = page.locator('select[name="fromAccountId"]');
        this.sendPaymentButton = page.locator('input[value="Send Payment"]');
        this.successMessage = page.locator('#rightPanel h1').filter({ hasText: 'Bill Payment Complete' });
        this.payeeName = page.locator('#payeeName');
        this.paymentAmount = page.locator('#amount');
    }

    /**
     * Navigate to the Bill Pay page.
     */
    async goto(): Promise<void> {
        await this.navigate('/parabank/billpay.htm');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Fill out the bill payment form.
     */
    async fillBillPayForm(payee: BillPayeeInfo): Promise<void> {
        await this.payeeNameInput.fill(payee.name);
        await this.payeeStreetInput.fill(payee.street);
        await this.payeeCityInput.fill(payee.city);
        await this.payeeStateInput.fill(payee.state);
        await this.payeeZipCodeInput.fill(payee.zipCode);
        await this.payeePhoneInput.fill(payee.phoneNumber);
        await this.payeeAccountInput.fill(payee.accountNumber);
        await this.verifyAccountInput.fill(payee.accountNumber);
        await this.amountInput.fill(payee.amount);
    }

    /**
     * Pay a bill using the specified payee info and source account.
     */
    async payBill(payee: BillPayeeInfo, fromAccount: string): Promise<void> {
        await this.fromAccountSelect.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000);

        await this.fillBillPayForm(payee);
        await this.fromAccountSelect.selectOption(fromAccount);
        await this.sendPaymentButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Assert that the bill payment was successful.
     */
    async expectPaymentSuccess(): Promise<void> {
        await expect(this.successMessage).toHaveText('Bill Payment Complete');
    }

    /**
     * Assert the payment was made to the correct payee with the correct amount.
     */
    async expectPaymentDetails(payeeName: string, amount: string): Promise<void> {
        await expect(this.page.locator('#payeeName')).toHaveText(payeeName);
        const formattedAmount = `$${Number(amount).toFixed(2)}`;
        await expect(this.page.locator('#amount')).toHaveText(formattedAmount);
    }
}
