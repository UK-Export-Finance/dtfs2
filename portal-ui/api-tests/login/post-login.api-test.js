jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  getPortalBankList: jest.fn().mockResolvedValue([]),
}));

const { AxiosError, HttpStatusCode } = require('axios');
const { when } = require('jest-when');
const { ROLES, PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const api = require('../../server/api');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');

const { post } = createApi(app);

const allRoles = Object.values(ROLES);

describe('POST /login', () => {
  const anEmail = 'an email';
  const aPassword = 'a password';
  const token = 'a token';

  afterEach(() => {
    jest.clearAllMocks();
  });

  const loginWith = ({ email, password }) => post({ email, password }).to('/login');

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/login'),
    whitelistedRoles: allRoles,
    successCode: HttpStatusCode.Ok,
  });

  describe('when the email is empty', () => {
    it('does not attempt to login', async () => {
      await loginWith({ email: '', password: aPassword });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('does not send a sign in link', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.sendSignInLink).not.toHaveBeenCalled();
    });
  });

  describe('when the password is empty', () => {
    it('does not attempt to login', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('does not send a sign in link', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.sendSignInLink).not.toHaveBeenCalled();
    });
  });

  describe('when the login attempt does not succeed', () => {
    beforeEach(() => {
      when(api.login).calledWith(anEmail, aPassword).mockRejectedValueOnce(new AxiosError());
    });

    it('does not send a sign in link', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInLink).not.toHaveBeenCalled();
    });
  });

  describe(`when the login attempt returns a ${HttpStatusCode.Forbidden}`, () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockRejectedValue({ response: { status: HttpStatusCode.Forbidden } });
    });

    it('does not send a sign in link', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInLink).not.toHaveBeenCalled();
    });

    it(`should return ${HttpStatusCode.Forbidden}`, async () => {
      const { status } = await loginWith({ email: anEmail, password: aPassword });
      expect(status).toEqual(HttpStatusCode.Forbidden);
    });
  });

  describe('when the login attempt succeeds', () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockResolvedValueOnce({
          token,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
          user: { email: anEmail },
        });
    });

    it('sends a sign in link', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInLink).toHaveBeenCalled();
    });

    it('redirects the user to the check-your-email page if the sign in link is sent successfully', async () => {
      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Found);
      expect(headers).toHaveProperty('location', '/login/check-your-email');
    });

    it('redirects the user to the check-your-email page if the sign in link is not sent successfully', async () => {
      when(api.sendSignInLink).calledWith(token).mockRejectedValueOnce(new AxiosError());

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Found);
      expect(headers).toHaveProperty('location', '/login/check-your-email');
    });

    it(`should return ${HttpStatusCode.Forbidden} if the sign in link returns ${HttpStatusCode.Forbidden}`, async () => {
      when(api.sendSignInLink)
        .calledWith(token)
        .mockRejectedValueOnce({ response: { status: HttpStatusCode.Forbidden } });

      const { status } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Forbidden);
    });
  });
});
