jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendAuthenticationEmail: jest.fn(),
  validateAuthenticationEmail: jest.fn(),
  validateToken: () => true,
}));
const { AxiosError } = require('axios');
const { when } = require('jest-when');
const api = require('../../server/api');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { post } = require('../create-api').createApi(app);
const { ROLES } = require('../../server/constants');

const allRoles = Object.values(ROLES);

describe('POST /login', () => {
  const anEmail = 'an email';
  const aPassword = 'a password';
  const token = 'a token';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const loginWith = ({ email, password }) => post({ email, password }).to('/login');

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/login'),
    whitelistedRoles: allRoles,
    successCode: 200,
  });

  describe('when the email is empty', () => {
    it('does not attempt to login', async () => {
      await loginWith({ email: '', password: aPassword });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('does not send an authentication email', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.sendAuthenticationEmail).not.toHaveBeenCalled();
    });
  });

  describe('when the password is empty', () => {
    it('does not attempt to login', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('does not send an authentication email', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.sendAuthenticationEmail).not.toHaveBeenCalled();
    });
  });

  describe('when the login attempt does not succeed', () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockRejectedValueOnce(new AxiosError());
    });

    it('does not send an authentication email', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendAuthenticationEmail).not.toHaveBeenCalled();
    });
  });

  describe('when the login attempt succeeds', () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockResolvedValueOnce({ token, loginStatus: 'Valid username and password' });
    });

    it('sends an authentication email', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendAuthenticationEmail).toHaveBeenCalled();
    });

    it('redirects the user to the check-your-email page if the authentication email is sent successfully', async () => {
      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toBe(302);
      expect(headers).toHaveProperty('location', '/login/check-your-email');
    });

    it('redirects the user to the check-your-email page if the authentication email is not sent successfully', async () => {
      when(api.sendAuthenticationEmail).calledWith(token).mockRejectedValueOnce(new AxiosError());

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toBe(302);
      expect(headers).toHaveProperty('location', '/login/check-your-email');
    });
  });
});
