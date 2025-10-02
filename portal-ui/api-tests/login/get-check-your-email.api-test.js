jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));
const { createApi } = require('@ukef/dtfs2-common/api-test');
const app = require('../../server/createApp');

const { get } = createApi(app);

const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');

describe('GET /login/check-your-email', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/check-your-email', {}, headers),
    validateResponseWasSuccessful: (response) => expect(response.status).toEqual(200),
  });
});
