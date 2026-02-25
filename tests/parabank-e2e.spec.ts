import { test, expect } from '../src/fixtures/parabank.fixtures';
import { generateUserData } from '../src/data/user.data';
import { CONSTANTS, DEFAULT_PAYEE } from '../src/data/constants';

test.describe('ParaBank E2E UI Test Suite', () => {
    test('Complete ParaBank user journey', async ({
        page,
        loginPage,
        registrationPage,
        homePage,
        openAccountPage,
        accountsOverviewPage,
        transferFundsPage,
        billPayPage,
        paraBankAPI,
    }) => {
        const testUser = generateUserData();
        let savingsAccountNumber: string;
        let defaultAccountNumber: string;

        await test.step('Navigate to ParaBank application', async () => {
            await loginPage.goto();
            await loginPage.expectTitleContains('ParaBank');
            await loginPage.expectLoginFormVisible();
        });

        await test.step('Create a new user from user registration page', async () => {
            await registrationPage.goto();
            await registrationPage.registerUser(testUser);

            console.log(`\n✅ User created — Username: ${testUser.username} | Password: ${testUser.password}\n`);

            await registrationPage.expectRegistrationSuccess(testUser.username);
        });

        await test.step('Login with newly created user', async () => {
            await page.context().clearCookies();

            await loginPage.goto();
            await loginPage.login(testUser.username, testUser.password);
            await homePage.expectLoggedIn();
            await expect(loginPage.page).toHaveURL(new RegExp(CONSTANTS.URLS.OVERVIEW));
        });

        await test.step('Verify global navigation menu is working as expected', async () => {
            await homePage.expectNavigationMenuVisible();
            await homePage.verifyNavigationLinks();
        });

        await test.step('Create a Savings account and capture account number', async () => {
            await homePage.goToAccountsOverview();
            defaultAccountNumber = await accountsOverviewPage.getAccountNumber(0);
            expect(defaultAccountNumber).toBeTruthy();

            await homePage.goToOpenNewAccount();
            savingsAccountNumber = await openAccountPage.openSavingsAccount();

            await openAccountPage.expectAccountOpened();
            await openAccountPage.expectValidAccountNumberString(savingsAccountNumber);
        });

        await test.step('Validate Accounts Overview displays balance details', async () => {
            await homePage.goToAccountsOverview();

            await accountsOverviewPage.expectPageTitle();
            await accountsOverviewPage.expectBalanceDetailsDisplayed();
            await accountsOverviewPage.expectAccountExists(savingsAccountNumber);
        });

        await test.step('Transfer funds from Savings account to another account', async () => {
            await homePage.goToTransferFunds();
            await transferFundsPage.transferFunds(CONSTANTS.TRANSFER_AMOUNT, defaultAccountNumber, savingsAccountNumber);
            await transferFundsPage.expectTransferComplete();
        });

        await test.step('Pay a bill using the Savings account', async () => {
            await homePage.goToBillPay();

            await billPayPage.payBill(DEFAULT_PAYEE, savingsAccountNumber);
            await billPayPage.expectPaymentSuccess();
            await billPayPage.expectPaymentDetails(DEFAULT_PAYEE.name, DEFAULT_PAYEE.amount);
        });

        await test.step('Search transactions and validate JSON response via API', async () => {
            // First, get all transactions for the account to determine a searchable amount.
            // ParaBank does not always index bill pay debits as findable transactions,
            // so we first confirm what transactions exist, then use the Find Transactions
            // by Amount API to search and validate the JSON response.
            const searchAmount = await paraBankAPI.expectTransactionsExist(savingsAccountNumber);

            await paraBankAPI.expectTransactionsByAmountValid(savingsAccountNumber, searchAmount);
        });
    });
});
