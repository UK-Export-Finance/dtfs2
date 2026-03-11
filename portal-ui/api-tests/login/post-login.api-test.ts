import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { ACCESS_CODE_PAGES, ROLES, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import api from '../../server/api';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';

const { post } = createApi(app);

const allRoles: string[] = Object.values(ROLES) as string[];

type RequestHeaders = {
  Cookie: string | string[];
};

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
}));

describe('POST /login', () => {
  const anEmail = 'an email';
  const aPassword = 'a password';
  const token = 'a token';

  afterEach(() => {
    jest.clearAllMocks();
  });

  const loginWith = ({ email, password }: { email: string; password: string }) => post({ email, password }).to('/login');

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => post({}, headers).to('/login'),
    whitelistedRoles: allRoles,
    successCode: 200,
  });

  describe('when the email is empty', () => {
    it('should not attempt to login', async () => {
      await loginWith({ email: '', password: aPassword });
      expect(api.login).not.toHaveBeenCalled();
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: '' });
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

  describe('when the login attempt returns a 403', () => {
    beforeEach(() => {
      when(api.login)
        .calledWith(anEmail, aPassword)
        .mockRejectedValue({ response: { status: 403 } });
    });

    it('should not send a sign in OTP', async () => {
      await loginWith({ email: anEmail, password: aPassword });
      expect(api.sendSignInOTP).not.toHaveBeenCalled();
    });

    it('should redirect to the temporarily suspended access code page', async () => {
      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(302);
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

      expect(status).toEqual(302);
      expect(headers).toHaveProperty('location', `/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`);
    });

    it('should redirect the user to /login if the sign in OTP is not sent successfully', async () => {
      when(api.sendSignInOTP).calledWith(token).mockRejectedValueOnce(new AxiosError());

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(302);
      expect(headers).toHaveProperty('location', '/login');
    });

    it('should redirect to the temporarily suspended access code page if the sign in OTP returns 403', async () => {
      when(api.sendSignInOTP)
        .calledWith(token)
        .mockRejectedValueOnce({ response: { status: 403 } });

      const { status, headers } = await loginWith({ email: anEmail, password: aPassword });

      expect(status).toEqual(302);
      expect(headers).toHaveProperty('location', `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`);
    });
  });
});
