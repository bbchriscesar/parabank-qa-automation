/**
 * Utility helpers for the ParaBank QA Automation framework.
 */

/**
 * Generates a random string of given length using alphanumeric characters.
 */
export function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a random numeric string of given length.
 */
export function randomDigits(length: number = 9): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Formats a currency amount to 2 decimal places.
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
