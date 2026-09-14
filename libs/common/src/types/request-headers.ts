/**
 * HTTP request headers used in API tests and helpers.
 *
 * This type models the subset of headers tests need to pass to the test
 * HTTP client (for example a `Cookie` header containing session information).
 * Any additional header is allowed via the index signature so this type stays
 * compatible with Node's `IncomingHttpHeaders` shape.
 *
 * @property Cookie - Optional `Cookie` header (string or array of cookie strings).
 */
export type RequestHeaders = {
  Cookie?: string | string[];
  [key: string]: string | string[] | undefined;
};
