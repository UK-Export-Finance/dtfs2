import { AxiosError, HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { ACCESS_CODE_PAGES, ROLES, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders } from '@ukef/dtfs2-common';
import api from '../../server/api';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInOTP: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  getPortalBankList: jest.fn().mockResolvedValue([]),
}));

describe('POST /login', () => {
  const { post } = createApi(app);
  const allRoles: string[] = Object.values(ROLES) as string[];

  const anEmail = 'an email';
  const aPassword = 'a password';
  const token = 'a token';

  const originalPortal2faEnabled = process.env.FF_PORTAL_2FA_ENABLED;

  beforeEach(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalPortal2faEnabled === undefined) {
      delete process.env.FF_PORTAL_2FA_ENABLED;
    } else {
      process.env.FF_PORTAL_2FA_ENABLED = originalPortal2faEnabled;
    }
  });

  const loginWith = ({ email, password }: { email: string; password: string }) => post({ email, password }).to('/login');

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => post({}, headers).to('/login'),
    whitelistedRoles: allRoles,
    successCode: HttpStatusCode.Ok,
  });

  describe('when the email is empty', () => {
    it('should not attempt to login', async () => {
      await loginWith({ email: '', password: aPassword });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: '', password: aPassword });
      expect(api.sendSignInOTP).not.toHaveBeenCalled();
    });
  });

  describe('when the password is empty', () => {
    it('should not attempt to login', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: '' });
      expect(api.sendSignInOTP).not.toHaveBeenCalled();
    });
  });

  describe('when the login attempt does not succeed', () => {
    beforeEach(() => {
      when(api.login).calledWith(anEmail, aPassword).mockRejectedValueOnce(new AxiosError());
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInOTP).not.toHaveBeenCalled();
    });
  });

  describe(`when the login attempt returns a ${HttpStatusCode.Forbidden}`, () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockRejectedValue({ response: { status: HttpStatusCode.Forbidden } });
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInOTP).not.toHaveBeenCalled();
    });

    it('should redirect to the temporarily suspended access code page', async () => {
      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Found);
      expect(headers).toHaveProperty('location', `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`);
    });
  });

  describe('when the login attempt succeeds', () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockResolvedValueOnce({
          token,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
          user: { email: anEmail, userId: '61e567d7db41bd65b00bd47a' },
        });
      when(api.sendSignInOTP)
        .calledWith(token)
        .mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 2 } });
    });

    it('should send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInOTP).toHaveBeenCalledWith(token);
    });

    it('should redirect the user to the check your email access code page if the sign in OTP is sent successfully', async () => {
      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Found);
      expect(headers).toHaveProperty('location', `/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`);
    });

    it('should redirect the user to /login if the sign in OTP is not sent successfully', async () => {
      when(api.sendSignInOTP).calledWith(token).mockRejectedValueOnce(new AxiosError());

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(headers).not.toHaveProperty('location');
    });

    it(`should redirect to the temporarily suspended access code page if the sign in OTP returns ${HttpStatusCode.Forbidden}`, async () => {
      when(api.sendSignInOTP)
        .calledWith(token)
        .mockRejectedValueOnce({ response: { status: HttpStatusCode.Forbidden } });

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(HttpStatusCode.Found);
      expect(headers).toHaveProperty('location', `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`);
    });
  });
});
