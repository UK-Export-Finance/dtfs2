const app = require('../../../src/createApp');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { get } = require('../../api')(app);

describe('GET /v1/validate', () => {
  const url = '/v1/validate';

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(url),
    makeRequestWithAuthHeader: (authHeader) => get(url, { headers: { Authorization: authHeader } }),
  });
});
