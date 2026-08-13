/**
 * Response shape used in API tests for endpoints that set session cookies.
 *
 * This models the portion of the HTTP response test helpers need: the
 * `set-cookie` header containing session cookies returned by the server.
 * Use this in tests and helpers that extract session cookies from responses.
 *
 * @property headers['set-cookie'] - An array of cookie strings set by the server.
 */
export type SessionCookieResponse = {
  headers: {
    'set-cookie': string[];
  };
};
