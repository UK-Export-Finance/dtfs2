import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { ACCESS_CODE_PAGES } from '@ukef/dtfs2-common';
import { postLogin } from './post-login';
import { validationErrorHandler } from '../../helpers';
import { MOCK_PORTAL_SESSION_USER } from '../../test-mocks/mock-portal-session-user';
import api from '../../api';

jest.mock('../../api');
console.error = jest.fn();

const token = 'mock-token';

const body = {
  email: 'test@example.com',
  password: 'password123',
};

const user = {
  ...MOCK_PORTAL_SESSION_USER,
  userId: 'mock-user-id',
};

describe('postLogin', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body,
      session: {},
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('email and password validation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render login page with errors if email and password are missing', async () => {
      req = {
        body: {
          email: '',
          password: '',
        },
        session: {},
      };

      await postLogin(req, res);

      const expectedErrors = [
        {
          errMsg: 'Enter an email address in the correct format, for example, name@example.com',
          errRef: 'email',
        },
        {
          errMsg: 'Enter a valid password',
          errRef: 'password',
        },
      ];

      expect(res.render).toHaveBeenNthCalledWith(1, 'login/index.njk', {
        errors: validationErrorHandler(expectedErrors),
      });
    });

    it('should render login page with email error if email is missing', async () => {
      req = {
        body: {
          ...body,
          email: '',
        },
        session: {},
      };

      await postLogin(req, res);

      const expectedErrors = [
        {
          errMsg: 'Enter an email address in the correct format, for example, name@example.com',
          errRef: 'email',
        },
      ];

      expect(res.render).toHaveBeenNthCalledWith(1, 'login/index.njk', {
        errors: validationErrorHandler(expectedErrors),
      });
    });

    it('should render login page with password error if password is missing', async () => {
      req = {
        body: {
          ...body,
          password: '',
        },
        session: {},
      };

      await postLogin(req, res);

      const expectedErrors = [
        {
          errMsg: 'Enter a valid password',
          errRef: 'password',
        },
      ];

      expect(res.render).toHaveBeenNthCalledWith(1, 'login/index.njk', {
        errors: validationErrorHandler(expectedErrors),
      });
    });
  });

  describe('2FA feature flag enabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortal2FAFeatureFlagEnabled').mockReturnValue(true);
    });

    describe('when api login in successful', () => {
      describe('when OTP sending is successful', () => {
        beforeEach(() => {
          jest.clearAllMocks();

          req = {
            body,
            session: {},
          };

          jest.mocked(api.login).mockResolvedValue({ token, loginStatus: 'success', user });
          jest.mocked(api.sendSignInOTP).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 2 } });
        });

        it('should call api.login with email and password', async () => {
          await postLogin(req, res);

          expect(api.login).toHaveBeenNthCalledWith(1, req.body.email, req.body.password);
        });

        it('should call api.sendSignInOTP with user token', async () => {
          await postLogin(req, res);

          expect(api.sendSignInOTP).toHaveBeenNthCalledWith(1, token);
        });

        it('should not call api.sendSignInLink', async () => {
          await postLogin(req, res);

          expect(api.sendSignInLink).toHaveBeenCalledTimes(0);
        });

        it(`should redirect to ${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL} when 2 attempts are remaining`, async () => {
          await postLogin(req, res);

          const expected = `/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`;

          expect(res.redirect).toHaveBeenNthCalledWith(1, expected);
        });

        it(`should redirect to ${ACCESS_CODE_PAGES.NEW_ACCESS_CODE} when 1 attempt is remaining`, async () => {
          jest.mocked(api.sendSignInOTP).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 1 } });

          await postLogin(req, res);

          const expected = `/login/${ACCESS_CODE_PAGES.NEW_ACCESS_CODE}`;

          expect(res.redirect).toHaveBeenNthCalledWith(1, expected);
        });

        it(`should redirect to ${ACCESS_CODE_PAGES.RESEND_ANOTHER_ACCESS_CODE} when 0 attempts are remaining`, async () => {
          jest.mocked(api.sendSignInOTP).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 0 } });

          await postLogin(req, res);

          const expected = `/login/${ACCESS_CODE_PAGES.RESEND_ANOTHER_ACCESS_CODE}`;

          expect(res.redirect).toHaveBeenNthCalledWith(1, expected);
        });

        it(`it should redirect to ${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT} when -1 attempts are remaining`, async () => {
          jest.mocked(api.sendSignInOTP).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: -1 } });

          await postLogin(req, res);

          const expected = `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`;

          expect(res.redirect).toHaveBeenNthCalledWith(1, expected);
        });
      });

      describe('when OTP sending fails', () => {
        const error = new Error('OTP sending failed');

        beforeEach(() => {
          jest.clearAllMocks();

          req = {
            body,
            session: {},
          };

          jest.mocked(api.login).mockResolvedValue({ token, loginStatus: 'success', user: MOCK_PORTAL_SESSION_USER });
          jest.mocked(api.sendSignInOTP).mockRejectedValue(error);
        });

        it('should log the error and continue the login flow by redirecting the login page', async () => {
          await postLogin(req, res);

          const expectedMessage = 'Failed to send sign in OTP. The login flow will continue as the user can retry on the next page. The error was ';
          expect(console.error).toHaveBeenNthCalledWith(1, '%s %o', expectedMessage, error);

          expect(res.redirect).toHaveBeenNthCalledWith(1, '/login');
        });

        it(`should redirect to login/temporarily-suspended-access-code when a ${HttpStatusCode.Forbidden} error is thrown`, async () => {
          const forbiddenError = { response: { status: HttpStatusCode.Forbidden } };
          jest.mocked(api.sendSignInOTP).mockRejectedValue(forbiddenError);

          await postLogin(req, res);

          expect(console.error).toHaveBeenNthCalledWith(
            1,
            'Access temporarily suspended for user %s, setting numberOfSignInOtpAttemptsRemaining to -1',
            req.body.email,
          );

          expect(res.redirect).toHaveBeenNthCalledWith(1, '/login/temporarily-suspended-access-code');
        });
      });

      describe('when api login fails', () => {
        const error = new Error('Login failed');

        beforeEach(() => {
          jest.clearAllMocks();

          req = {
            body,
            session: {},
          };

          jest.mocked(api.login).mockRejectedValue(error);
        });

        it('should log the error and render the login page with errors', async () => {
          await postLogin(req, res);

          expect(console.error).toHaveBeenNthCalledWith(1, 'Failed to login %o', error);

          const expectedErrors = [
            {
              errMsg: 'Enter an email address in the correct format, for example, name@example.com',
              errRef: 'email',
            },
            {
              errMsg: 'Enter a valid password',
              errRef: 'password',
            },
          ];

          expect(res.render).toHaveBeenNthCalledWith(1, 'login/index.njk', {
            errors: validationErrorHandler(expectedErrors),
          });
        });

        it(`should render login/temporarily-suspended-access-code.njk when a ${HttpStatusCode.Forbidden} error is thrown`, async () => {
          const forbiddenError = { response: { status: HttpStatusCode.Forbidden } };
          jest.mocked(api.login).mockRejectedValue(forbiddenError);

          await postLogin(req, res);

          expect(console.error).toHaveBeenNthCalledWith(2, 'Access temporarily suspended for user %s', req.body.email);

          expect(res.redirect).toHaveBeenNthCalledWith(1, '/login/temporarily-suspended-access-code');
        });
      });
    });
  });
});
