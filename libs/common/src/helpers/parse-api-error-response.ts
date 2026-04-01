/**
 * Represents a typical API error response body where validation or other errors
 * are returned as an array under an `errors` key. Each error object may
 * contain an optional `msg` string describing the problem.
 */
export type ApiErrorResponse = {
  errors?: Array<{ msg?: string }>;
};

/**
 * Attempts to parse an unknown value as an {@link ApiErrorResponse}.
 *
 * Returns the value typed as {@link ApiErrorResponse} when it is a non-null,
 * non-array object that has an `errors` key; otherwise returns `undefined`.
 *
 * This avoids unsafe `as` assertions when accessing `response.data.errors`.
 *
 * Example:
 * ```ts
 * const errors = parseApiErrorResponse(apiError.response?.data)?.errors;
 * ```
 *
 * @param value - The value to parse.
 * @returns The value as {@link ApiErrorResponse}, or `undefined` if the value
 * does not match the expected shape.
 */
export const parseApiErrorResponse = (value: unknown): ApiErrorResponse | undefined => {
  // Defensive checks: must be a non-null, non-array object
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;

  // Check for presence of the `errors` key on the object
  if (!('errors' in value)) return undefined;

  const apiErrorResponse = value as ApiErrorResponse;

  return apiErrorResponse;
};
