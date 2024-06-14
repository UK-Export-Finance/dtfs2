const app = require('../../../src/createApp');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const { get } = require('../../api')(app);

jest.mock('../../../src/external-api/api', () => ({
  bankHolidays: {
    getBankHolidays: () => ({ status: 200 }),
  },
}));

describe('/v1/bank-holidays', () => {
  describe('GET /v1/bank-holidays', () => {
    const urlToGetBankHolidays = '/v1/bank-holidays';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetBankHolidays),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetBankHolidays, { headers: { Authorization: authHeader } }),
    });
  });
});
