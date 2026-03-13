/**
 * Check whether an API `errors` array includes any message containing a substring.
 *
 * This utility searches an `errors` array (the common `{ errors?: { msg?: string }[] }`
 * shape returned by our APIs) and returns `true` if any `msg` contains the given
 * substring (case-insensitive). It is a small, focused helper for domain logic
 * such as detecting expired OTP messages.
 *
 * Example:
 * ```ts
 * const data = apiError.response?.data;
 * if (isApiErrorResponse(data) && errorsIncludeMessage(data.errors, 'expired')) {
 *   // handle expired case
 * }
 * ```
 *
 * @param errors - An array of error objects or `undefined`.
 * @param substring - Substring to search for inside error `msg` values.
 * @returns `true` when at least one `msg` includes the substring (case-insensitive).
 */
export const errorsIncludeMessage = (errors: Array<{ msg?: string }> | undefined, substring: string): boolean =>
  !!errors && Array.isArray(errors) && errors.some((e) => typeof e.msg === 'string' && e.msg.toLowerCase().includes(substring.toLowerCase()));

export default errorsIncludeMessage;
