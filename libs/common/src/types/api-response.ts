/**
 * Lightweight HTTP response shape used in API tests and helpers.
 *
 * Use this type in test code and helper utilities that assert on the
 * response `status` and `headers` (for example the `location` header
 * produced by redirects). This is intentionally minimal — controllers
 * should continue to use `express.Response` for runtime handling.
 *
 * @property status - HTTP status code returned by the request.
 * @property headers.location - Optional `Location` header for redirects.
 */
export type ApiResponse = {
  status: number;
  headers: {
    location?: string;
    [key: string]: unknown;
  };
};
