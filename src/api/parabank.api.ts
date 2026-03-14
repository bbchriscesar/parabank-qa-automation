import { APIRequestContext, Page, expect } from '@playwright/test';
import { UserRegistrationData } from '../data/user.data';

const BASE_URL = process.env.BASE_URL as string;

export class ParaBankAPI {
    // [INTERVIEW Q]: Why optionally pass `Page` to an API class?
    // [ANSWER]: It allows the API to share the browser's context (cookies, session state). If only `request` is passed, the API calls execute in an isolated context and wouldn't be authenticated as the logged-in UI user.
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

        // [INTERVIEW Q]: Why use `page.request` here instead of the global `this.request`?
        // [ANSWER]: `page.request` is tied to the current browser page. This means the API POST will automatically include the cookies/session established by the `page.goto` in step 1, matching a hybrid UI/API test approach.
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

        // [INTERVIEW Q]: What does `maxRedirects: 0` do here?
        // [ANSWER]: Often in form submissions, success results in an HTTP 302 Redirect. Setting maxRedirects to 0 allows us to catch the 302 response itself without Playwright automatically following the redirect, though here we just assert .ok().
        const response = await page.request.post(`${BASE_URL}/parabank/register.htm`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/parabank/register.htm`,
            },
            data: formData.toString(),
            maxRedirects: 0,
        });

        expect(response.ok(), `API registration failed with status ${response.status()}`).toBeTruthy();

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
        // [INTERVIEW Q]: Explain this fallback logic `this.page ? this.page.request : this.request`.
        // [ANSWER]: If the class was initialized with a `page` (meaning part of a UI test), it uses `page.request` to inherit the UI's cookies. If it's a pure API test (no `page`), it falls back to the isolated `this.request` context.
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

        expect(response.ok(), `API findTransactionsByAmount failed with status ${response.status()}`).toBeTruthy();

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

        expect(response.ok(), `API getAllTransactions failed with status ${response.status()}`).toBeTruthy();

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
        // [INTERVIEW Q]: Instead of using multiple expects, what's a more modern way to validate this payload?
        // [ANSWER]: We could use structural validation with a schema validation library like Zod or AJV, or at least a single object match like `expect(transaction).toEqual(expect.objectContaining({ id: expect.any(String), accountId: expect.any(Number) ... }))`.
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

        expect(response.ok(), `API getAccountDetails failed with status ${response.status()}`).toBeTruthy();

        const body = await response.json();
        return { response, body };
    }
}
