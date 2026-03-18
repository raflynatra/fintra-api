/**
 * Email validation regex
 * Matches basic email format: user@domain.com
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UUID validation regex (version 4)
 * Matches standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Strong password regex
 * Requires:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Check if a string is a valid email format
 *
 * @param email - Email string to validate
 * @returns true if valid email format, false otherwise
 *
 * Example:
 * ```
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email")    // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Check if a string is a valid UUID
 *
 * @param id - String to validate as UUID
 * @returns true if valid UUID format, false otherwise
 *
 * Example:
 * ```
 * isValidUUID("123e4567-e89b-12d3-a456-426614174000") // true
 * isValidUUID("invalid-uuid")                          // false
 * ```
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Check if a password meets strength requirements
 *
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 *
 * @param password - Password to validate
 * @returns true if password is strong, false otherwise
 *
 * Example:
 * ```
 * isStrongPassword("Password123") // true
 * isStrongPassword("weak")        // false
 * ```
 */
export function isStrongPassword(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}

/**
 * Check if a string is not empty (after trimming whitespace)
 *
 * @param value - String to check
 * @returns true if string has content, false if empty or only whitespace
 *
 * Example:
 * ```
 * isNotEmpty("hello")    // true
 * isNotEmpty("  ")       // false
 * isNotEmpty("")         // false
 * ```
 */
export function isNotEmpty(value: string): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

/**
 * Check if a number is within a range
 *
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if number is within range
 *
 * Example:
 * ```
 * isInRange(5, 1, 10)  // true
 * isInRange(15, 1, 10) // false
 * ```
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sanitize a string by removing leading/trailing whitespace
 *
 * @param value - String to sanitize
 * @returns Trimmed string
 *
 * Example:
 * ```
 * sanitizeString("  hello  ") // "hello"
 * ```
 */
export function sanitizeString(value: string): string {
  return value.trim();
}

/**
 * Sanitize email address
 * - Convert to lowercase (emails are case-insensitive)
 * - Remove leading/trailing whitespace
 *
 * @param email - Email to sanitize
 * @returns Sanitized email
 *
 * Example:
 * ```
 * sanitizeEmail("  User@Example.COM  ") // "user@example.com"
 * ```
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize name field
 * - Remove leading/trailing whitespace
 * - Normalize multiple spaces to single space
 *
 * @param name - Name to sanitize
 * @returns Sanitized name
 *
 * Example:
 * ```
 * sanitizeName("  John   Doe  ") // "John Doe"
 * ```
 */
export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Format a number as currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 *
 * Example:
 * ```
 * formatCurrency(1234.56)           // "$1,234.56"
 * formatCurrency(1234.56, "EUR")    // "€1,234.56"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string
 *
 * Example:
 * ```
 * formatDate(new Date("2024-01-15")) // "2024-01-15"
 * ```
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Round number to specified decimal places
 *
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 *
 * Example:
 * ```
 * roundToDecimals(1.2345, 2) // 1.23
 * roundToDecimals(1.2345, 0) // 1
 * ```
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Check if value is a number (not NaN)
 *
 * @param value - Value to check
 * @returns true if value is a valid number
 *
 * Example:
 * ```
 * isNumber(123)        // true
 * isNumber(NaN)        // false
 * isNumber("123")      // false
 * ```
 */
export function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Check if value is a string
 *
 * @param value - Value to check
 * @returns true if value is a string
 *
 * Example:
 * ```
 * isString("hello")  // true
 * isString(123)      // false
 * ```
 */
export function isString(value: any): value is string {
  return typeof value === "string";
}

/**
 * Check if value is a valid Date object
 *
 * @param value - Value to check
 * @returns true if value is a valid Date
 *
 * Example:
 * ```
 * isDate(new Date())            // true
 * isDate(new Date("invalid"))   // false
 * isDate("2024-01-15")          // false
 * ```
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}
