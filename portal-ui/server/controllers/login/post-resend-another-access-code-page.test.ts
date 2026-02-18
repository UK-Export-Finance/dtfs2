import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { postResendAnotherAccessCodePage, PostResendAnotherAccessCodePageRequest } from './post-resend-another-access-code-page';
import * as api from '../../api';
import { validationErrorHandler } from '../../helpers';
import * as updateSessionModule from '../../helpers/updateSessionAfterLogin';

jest.mock('../../api');
jest.mock('../../helpers');
jest.mock('../../helpers/updateSessionAfterLogin');

describe('controllers/login/post-resend-another-access-code-page', () => {
  let res: Response;
  let renderMock: jest.Mock;
  let redirectMock: jest.Mock;
  const mockUpdateSessionAfterLogin = updateSessionModule.updateSessionAfterLogin as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    renderMock = jest.fn();
    redirectMock = jest.fn();

    res = {
      render: renderMock,
      redirect: redirectMock,
    } as unknown as Response;

    mockUpdateSessionAfterLogin.mockImplementation(() => {});
  });

  const mockLoginWithSignInOtp = api.loginWithSignInOtp as jest.Mock;
  const mockValidationErrorHandler = validationErrorHandler as jest.Mock;
  console.error = jest.fn();

  describe('when login status is not VALID_2FA', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          sixDigitAccessCode: '123456',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-123',
          numberOfSignInOtpAttemptsRemaining: 0,
        },
      } as unknown as PostResendAnotherAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });
      mockValidationErrorHandler.mockReturnValue({ some: 'error' });

      await postResendAnotherAccessCodePage(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer test-token',
        userId: 'user-123',
        signInOTP: '123456',
      });
    });

    it('should call validationErrorHandler with correct arguments', () => {
      expect(mockValidationErrorHandler).toHaveBeenCalledWith({
        errMsg: 'The access code you have entered is incorrect',
        errRef: 'sixDigitAccessCode',
      });
    });

    it('should render the new access code template with validation errors', () => {
      expect(renderMock).toHaveBeenCalledWith('login/resend-another-access-code.njk', {
        attemptsLeft: 0,
        requestNewCodeUrl: '/login/request-new-access-code',
        errors: { some: 'error' },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          sixDigitAccessCode: '123456',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-456',
          numberOfSignInOtpAttemptsRemaining: 0,
        },
      } as unknown as PostResendAnotherAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      await postResendAnotherAccessCodePage(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer valid-token',
        userId: 'user-456',
        signInOTP: '123456',
      });
    });

    it('should redirect to dashboard', () => {
      expect(redirectMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('when an error occurs', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          sixDigitAccessCode: '123456',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-789',
          numberOfSignInOtpAttemptsRemaining: 0,
        },
      } as unknown as PostResendAnotherAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      await postResendAnotherAccessCodePage(req, res);
    });

    it('should render the problem with service template', () => {
      expect(console.error).toHaveBeenCalledWith('Error during login with sign-in OTP %o', expect.any(Error));
      expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
