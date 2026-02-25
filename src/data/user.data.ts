import { randomDigits } from '../utils/helpers';

export interface UserRegistrationData {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    ssn: string;
    username: string;
    password: string;
}

export function generateUserData(): UserRegistrationData {
    return {
        firstName: `Test`,
        lastName: `User`,
        street: `${randomDigits(4)} Automation Ave`,
        city: 'TestCity',
        state: 'CA',
        zipCode: randomDigits(5),
        phoneNumber: randomDigits(10),
        ssn: randomDigits(9),
        username: `parauser${Math.floor(Math.random() * 1000000000)}`,
        password: 'Test@1234',
    };
}
