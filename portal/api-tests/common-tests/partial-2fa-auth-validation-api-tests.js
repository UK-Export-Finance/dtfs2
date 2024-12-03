const { when } = require('jest-when');
const { login, validatePartialAuthToken } = require('../../server/api');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');
const { post } = require('../create-api').createApi(app);

const email = 'mock email';
const password = 'mock password';

const partialAuthToken = 'partial auth token';

const withPartial2faAuthValidationApiTests = ({ makeRequestWithHeaders, validateResponseWasSuccessful }) => {
  describe('partial 2fa auth validation', () => {
    let sessionCookie;

    beforeEach(async () => {
      when(validatePartialAuthToken).resetWhenMocks();
      login.mockImplementation(mockLogin(partialAuthToken));
      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
    });

    it('redirects to /login if the user does not have a session', async () => {
      const response = await makeRequestWithHeaders();
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/login');
    });

    it('redirects to /login if the user has a session with an invalid partial auth token', async () => {
      when(validatePartialAuthToken).calledWith(expect.any(String)).mockRejectedValueOnce(new Error('test error'));

      const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/login');
    });

    it('succeeds if the user has a session with a valid partial auth token', async () => {
      when(validatePartialAuthToken).calledWith(partialAuthToken).mockResolvedValueOnce();

      const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

      validateResponseWasSuccessful(response);
    });
  });
};

module.exports = {
  withPartial2faAuthValidationApiTests,
};
