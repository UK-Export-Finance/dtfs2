import { customValidateStatus } from './custom-axios-validate-status';

describe('customValidateStatus', () => {
  /**
   * Official codes only referred from:
   * 1. https://www.rfc-editor.org/rfc/rfc9110.html#name-500-internal-server-error
   * 2. https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
   */
  const falseCodes: Array<number> = [199, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511];
  const trueCodes: Array<number> = [200, 201, 202, 301, 302, 400, 401, 403, 404, 422, 429];

  it.each(falseCodes)('should return false for HTTP status code %s', (code) => {
    const result = customValidateStatus(code);

    expect(result).toBe(false);
  });

  it.each(trueCodes)('should return true for HTTP status code %s', (code) => {
    const result = customValidateStatus(code);

    expect(result).toBe(true);
  });
});
