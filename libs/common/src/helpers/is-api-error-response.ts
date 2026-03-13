/**
 * Represents a typical API error response body where validation or other errors
 * are returned as an array under an `errors` key. Each error object may
 * contain an optional `msg` string describing the problem.
 */
export type ApiErrorResponse = {
  errors?: Array<{ msg?: string }>;
};

/**
 * Type guard that checks whether a value resembles an API error response body
 * with an `errors` array (for example, Axios `response.data` from our APIs).
 *
 * Use this guard before accessing `response.data.errors` so TypeScript knows
 * the property exists and to avoid unsafe `as` assertions.
 *
 * Example:
 * const data = apiError.response?.data;
 * if (isApiErrorResponse(data)) {
 *   // data.errors is safe to access
 * }
 *
 * @param value - The value to check for an `errors` property.
 * @returns `true` when `value` is a non-array object that has an `errors` key.
 */
export const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'errors' in (value as Record<string, unknown>);
