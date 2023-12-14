const removeCsrfToken = require('../../../../src/v1/routes/middleware/remove-csrf-token');
const { mockReq, mockReqWithCsrf, mockRes, mockNext } = require('../../mocks');

describe('routes/middleware/remove-csrf-token', () => {
  const next = mockNext;
  const res = mockRes();

  it('Request with csrf token should have csrf', () => {
    const reqWithCsrfToken = mockReqWithCsrf();

    removeCsrfToken(reqWithCsrfToken, res, next);

    expect(reqWithCsrfToken?.body?._csrf).toBeUndefined();
  });

  it('Request without csrf token should be unaffected', () => {
    const req = mockReq();

    removeCsrfToken(req, res, next);

    expect(req?.body?._csrf).toBeUndefined();
  });
});
