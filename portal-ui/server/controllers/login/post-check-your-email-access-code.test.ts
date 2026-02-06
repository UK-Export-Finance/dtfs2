import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { PostCheckYourEmailAccessCodePageRequest, postCheckYourEmailAccessCodePage } from './post-check-your-email-access-code';
import * as api from '../../api';

jest.mock('../../api');
jest.mock('../../helpers');

describe('postCheckYourEmailAccessCodePage', () => {
  let res: Response;
  let renderMock: jest.Mock;
  let redirectMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    renderMock = jest.fn();
    redirectMock = jest.fn();
    res = {
      render: renderMock,
      redirect: redirectMock,
    } as unknown as Response;
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockLoginWithSignInOtp = api.loginWithSignInOtp as jest.Mock;

  describe('when login status is not VALID_2FA', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '654321',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });

      await postCheckYourEmailAccessCodePage(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer test-token',
        userId: 'user-abc',
        signInOTP: '654321',
      });
    });

    it('should render the check your email access code template with validation errors', () => {
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/request-new-access-code',
        email: 'test@example.com',
        errors: {
          errorSummary: [{ text: 'The access code you have entered is incorrect', href: 'signInOTP' }],
          fieldErrors: {
            signInOTP: { text: 'The access code you have entered is incorrect', href: 'signInOTP' },
          },
        },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '654321',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-def',
          numberOfSignInOtpAttemptsRemaining: 3,
          userEmail: 'valid@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      await postCheckYourEmailAccessCodePage(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer valid-token',
        userId: 'user-def',
        signInOTP: '654321',
      });
    });

    it('should redirect to sign-in-link after successful OTP', () => {
      expect(redirectMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('when an error occurs', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '654321',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-err',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'err@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      await postCheckYourEmailAccessCodePage(req, res);
    });

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk', expect.any(Object));
    });
  });

  describe('when numberOfSignInOtpAttemptsRemaining is undefined', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '654321',
        },
        session: {
          userToken: 'Bearer missing-attempts-token',
          userId: 'user-missing',
          userEmail: 'missing@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      await postCheckYourEmailAccessCodePage(req, res);
    });

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk', expect.any(Object));
    });
  });
});
