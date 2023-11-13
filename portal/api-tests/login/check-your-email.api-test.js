jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  validatePartialAuthToken: jest.fn(),
}));

const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');

describe('GET /login/check-your-email', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/check-your-email', {}, headers),
    validateResponseWasSuccessful: (response) => expect(response.status).toBe(200),
  });
});

// TODO DTFS2-6770: api tests
describe('POST /login/check-your-email', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/login/check-your-email'),
    validateResponseWasSuccessful: (response) => {
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login/check-your-email');
    },
  });
});
