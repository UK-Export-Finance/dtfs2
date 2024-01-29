const app = require('../../server/createApp');
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');
const { get } = require('../create-api').createApi(app);

describe('GET /login/sign-in-link-expired', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/sign-in-link-expired', {}, headers),
    validateResponseWasSuccessful: (response) => expect(response.status).toBe(200),
  });
});
