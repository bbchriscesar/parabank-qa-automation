export const CONSTANTS = {
    BILL_PAY_AMOUNT: '50',
    TRANSFER_AMOUNT: '100',
    URLS: {
        REGISTER: '/parabank/register.htm',
        OVERVIEW: '/parabank/overview.htm',
        OPEN_ACCOUNT: '/parabank/openaccount.htm',
        BILL_PAY: '/parabank/billpay.htm',
        API_ACCOUNTS: '/parabank/services/bank/accounts',
    }
};

export const DEFAULT_PAYEE = {
    name: 'Utility Company',
    street: '456 Service Blvd',
    city: 'PayCity',
    state: 'NY',
    zipCode: '10001',
    phoneNumber: '5551234567',
    accountNumber: '54321',
    amount: CONSTANTS.BILL_PAY_AMOUNT,
};
