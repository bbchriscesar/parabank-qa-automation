/**
 * ParaBankAPI — API helper for the hybrid test framework.
 *
 * Uses Playwright's APIRequestContext to perform API calls for:
 * - User registration (hybrid: API signup, UI validation)
 * - Finding transactions by amount
 */

import { APIRequestContext, Page, expect } from '@playwright/test';
import { UserRegistrationData } from '../data/user.data';

const BASE_URL = process.env.BASE_URL as string;

export class ParaBankAPI {
    private request: APIRequestContext;
    private page?: Page;

    constructor(request: APIRequestContext, page?: Page) {
        this.request = request;
        this.page = page;
    }

    /**
     * Set the page reference so API calls can use the browser's authenticated session.
     */
    setPage(page: Page) {
        this.page = page;
    }

    /**
     * Register a new user via the POST /parabank/register.htm endpoint.
     *
     * Hybrid approach (matching signing_up_endpoints.txt):
     *  1. Navigate to the registration page in the browser → establishes session
     *  2. POST form data using `page.request` → shares the browser's cookies
     *
     * @param user - The registration data
     * @param page - The Playwright Page (browser) to establish the session
     * @returns The raw response object for assertion.
     */
    async registerUser(user: UserRegistrationData, page: Page) {
        // Step 1: Open the registration page in the browser to establish the session
        await page.goto(`${BASE_URL}/parabank/register.htm`);
        await page.waitForLoadState('networkidle');

        // Step 2: POST form data using page.request (shares the browser's cookies/session)
        const formData = new URLSearchParams({
            'customer.firstName': user.firstName,
            'customer.lastName': user.lastName,
            'customer.address.street': user.street,
            'customer.address.city': user.city,
            'customer.address.state': user.state,
            'customer.address.zipCode': user.zipCode,
            'customer.phoneNumber': user.phoneNumber,
            'customer.ssn': user.ssn,
            'customer.username': user.username,
            'customer.password': user.password,
            'repeatedPassword': user.password,
        });

        const response = await page.request.post(`${BASE_URL}/parabank/register.htm`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/parabank/register.htm`,
            },
            data: formData.toString(),
            maxRedirects: 0,
        });

        return response;
    }

    /**
     * Find transactions by amount using the ParaBank REST API.
     *
     * GET /parabank/services/bank/accounts/{accountId}/transactions/amount/{amount}
     *
     * @param accountId - The account to search transactions for
     * @param amount - The transaction amount to search for
     * @returns The parsed JSON response array of transactions
     */
    async findTransactionsByAmount(accountId: string, amount: string) {
        // Use page.request if available — it shares the browser's authenticated session/cookies.
        const reqContext = this.page ? this.page.request : this.request;

        const response = await reqContext.get(
            `${BASE_URL}/parabank/services/bank/accounts/${accountId}/transactions/amount/${amount}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const body = await response.json();
        return { response, body };
    }

    /**
     * Get all transactions for an account via the REST API.
     *
     * GET /parabank/services/bank/accounts/{accountId}/transactions
     *
     * @param accountId - The account ID to retrieve transactions for
     * @returns The parsed JSON response array of transactions
     */
    async getAllTransactions(accountId: string) {
        const reqContext = this.page ? this.page.request : this.request;

        const response = await reqContext.get(
            `${BASE_URL}/parabank/services/bank/accounts/${accountId}/transactions`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const body = await response.json();
        return { response, body };
    }

    /**
     * Assert that the account has transactions and return the first transaction's amount.
     *
     * Validates:
     * - HTTP 200 status
     * - Response is a non-empty array
     *
     * @param accountId - The account to check transactions for
     * @returns The amount of the first transaction (as a string) for further searching
     */
    async expectTransactionsExist(accountId: string): Promise<string> {
        const { response, body } = await this.getAllTransactions(accountId);

        expect(response.status()).toBe(200);
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);

        return body[0].amount.toString();
    }

    /**
     * Search transactions by amount and validate the JSON response structure.
     *
     * Validates:
     * - HTTP 200 status
     * - Response is a non-empty array
     * - Transaction has all required properties (id, accountId, type, date, amount, description)
     * - Transaction amount matches the searched amount
     * - Transaction belongs to the correct account
     * - Transaction description is not empty
     *
     * @param accountId - The account to search transactions for
     * @param amount - The amount to search by
     */
    async expectTransactionsByAmountValid(accountId: string, amount: string): Promise<void> {
        const { response, body } = await this.findTransactionsByAmount(accountId, amount);

        expect(response.status()).toBe(200);
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);

        const transaction = body[0];
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('accountId');
        expect(transaction).toHaveProperty('type');
        expect(transaction).toHaveProperty('date');
        expect(transaction).toHaveProperty('amount');

        expect(transaction.amount).toBe(parseFloat(amount));
        expect(transaction.accountId.toString()).toBe(accountId);
        expect(transaction).toHaveProperty('description');
        expect(transaction.description).toBeTruthy();
    }

    /**
     * Get account details via the REST API.
     *
     * GET /parabank/services/bank/accounts/{accountId}
     *
     * @param accountId - The account ID to retrieve
     * @returns The parsed JSON response with account details
     */
    async getAccountDetails(accountId: string) {
        const response = await this.request.get(
            `${BASE_URL}/parabank/services/bank/accounts/${accountId}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const body = await response.json();
        return { response, body };
    }
}
