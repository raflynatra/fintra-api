import crypto from "crypto";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const DEFAULT_PASSWORD_CONFIG = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSpecial: true,
};

export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecial?: boolean;
}

/**
 * Generate a secure random password
 *
 * Uses cryptographically secure random number generation (crypto.randomBytes)
 * to ensure passwords are unpredictable and secure.
 *
 * @param options - Configuration for password generation
 * @returns A randomly generated secure password
 * @throws Error if no character sets are enabled or length is too short
 *
 * @example
 * // Generate default password (12 chars, all character types)
 * const password = generatePassword();
 * // Example output: "aB3!xY7@mN2$"
 *
 * @example
 * // Generate longer password without special characters
 * const password = generatePassword({
 *   length: 16,
 *   includeSpecial: false
 * });
 * // Example output: "aB3xY7mN2pQ9rS4t"
 *
 * @example
 * // Generate simple numeric PIN
 * const pin = generatePassword({
 *   length: 6,
 *   includeUppercase: false,
 *   includeLowercase: false,
 *   includeSpecial: false
 * });
 * // Example output: "847293"
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const config = {
    ...DEFAULT_PASSWORD_CONFIG,
    ...options,
  };

  if (config.length < 4) {
    throw new Error("Password length must be at least 4 characters");
  }

  let characterPool = "";
  const requiredChars: string[] = [];

  if (config.includeUppercase) {
    characterPool += UPPERCASE;
    requiredChars.push(getRandomChar(UPPERCASE));
  }

  if (config.includeLowercase) {
    characterPool += LOWERCASE;
    requiredChars.push(getRandomChar(LOWERCASE));
  }

  if (config.includeNumbers) {
    characterPool += NUMBERS;
    requiredChars.push(getRandomChar(NUMBERS));
  }

  if (config.includeSpecial) {
    characterPool += SPECIAL;
    requiredChars.push(getRandomChar(SPECIAL));
  }

  if (characterPool.length === 0) {
    throw new Error("At least one character set must be enabled");
  }

  if (requiredChars.length > config.length) {
    throw new Error(
      `Password length (${config.length}) must be at least ${requiredChars.length} to include all required character types`,
    );
  }

  const remainingLength = config.length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    requiredChars.push(getRandomChar(characterPool));
  }

  const shuffledPassword = shuffleArray(requiredChars);
  return shuffledPassword.join("");
}

/**
 * Get a random character from a string using crypto.randomBytes
 * More secure than Math.random() for password generation
 *
 * @param chars - String containing characters to choose from
 * @returns A single random character from the input string
 */
function getRandomChar(chars: string): string {
  const randomIndex = crypto.randomBytes(1)[0] % chars.length;
  return chars[randomIndex];
}

/**
 * Shuffle an array using Fisher-Yates algorithm with crypto.randomBytes
 * Ensures random distribution of characters in the password
 *
 * @param array - Array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomBytes = crypto.randomBytes(2);
    const randomValue = randomBytes.readUInt16BE(0);
    const j = randomValue % (i + 1);

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Generate a simple numeric PIN
 * Convenience function for generating numeric-only passwords
 *
 * @param length - Length of the PIN (default: 6)
 * @returns A random numeric PIN
 *
 * @example
 * const pin = generatePin(4);
 * // Example output: "7392"
 */
export function generatePin(length: number = 6): string {
  return generatePassword({
    length,
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: true,
    includeSpecial: false,
  });
}

/**
 * Generate a password with only alphanumeric characters (no special chars)
 * Useful when special characters might cause issues with certain systems
 *
 * @param length - Length of the password (default: 12)
 * @returns A random alphanumeric password
 *
 * @example
 * const password = generateAlphanumericPassword(16);
 * // Example output: "aB3xY7mN2pQ9rS4t"
 */
export function generateAlphanumericPassword(length: number = 12): string {
  return generatePassword({
    length,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: false,
  });
}
