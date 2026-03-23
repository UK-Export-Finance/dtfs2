type ApiErrorItem = { msg?: string };
type ApiErrors = ApiErrorItem[] | undefined;

/**
 * Check whether an API `errors` array contains any message that includes a
 * given substring (case-insensitive).
 *
 * Behaviour:
 * - The helper is defensive and returns `false` when `errors` is not an array
 *   or when `substring` is empty/falsey.
 * - Matching is case-insensitive and only performed for `msg` values that are strings.
 *
 * Example:
 * ```ts
 * const data = apiError.response?.data;
 * if (isApiErrorResponse(data) && errorsIncludeMessage(data.errors, 'expired')) {
 *   // handle expired case
 * }
 * ```
 *
 * @param errors API errors array (or `undefined`).
 * @param substring Substring to search for; case-insensitive match.
 * @returns `true` when at least one `msg` includes the substring.
 */
export const errorsIncludeMessage = (errors: ApiErrors, substring: string): boolean => {
  // Defensive checks: ensure `errors` is an array and `substring` is non-empty.
  if (!substring || !Array.isArray(errors)) return false;

  // Make lowercase so not case sensitive when comparing.
  const searchTerm = substring.toLowerCase();

  // Use `some` to check if any error message includes the substring and return the resulting boolean value.
  const hasErrorContainingMessage = errors.some((e) => typeof e.msg === 'string' && e.msg.toLowerCase().includes(searchTerm));

  return hasErrorContainingMessage;
};
