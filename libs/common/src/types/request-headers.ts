/**
 * HTTP request headers used in API tests and helpers.
 *
 * This type models the subset of headers tests need to pass to the test
 * HTTP client (for example a `Cookie` header containing session information).
 *
 * @property Cookie - A single `Cookie` string or an array of cookie strings.
 */
export type RequestHeaders = {
  Cookie: string | string[];
};
