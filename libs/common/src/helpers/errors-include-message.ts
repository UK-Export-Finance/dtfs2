/**
 * Check whether an API `errors` array contains any message that includes a
 * given substring (case-insensitive).
 *
 * Exported types:
 * - `ApiErrorItem` — shape of a single error object (may include `msg`).
 * - `ApiErrors` — an array of `ApiErrorItem` or `undefined`.
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
type ApiErrorItem = { msg?: string };
type ApiErrors = ApiErrorItem[] | undefined;

export const errorsIncludeMessage = (errors: ApiErrors, substring: string): boolean => {
  if (!Array.isArray(errors) || !substring) return false;

  const needle = substring.toLowerCase();

  return errors.some((e) => e.msg?.toLowerCase().includes(needle));
};
