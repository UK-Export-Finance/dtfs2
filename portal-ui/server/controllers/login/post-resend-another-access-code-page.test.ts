import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { postResendAnotherAccessCodePage, PostResendAnotherAccessCodePageRequest } from './post-resend-another-access-code-page';
import * as api from '../../api';
import { validationErrorHandler } from '../../helpers';

jest.mock('../../api');
jest.mock('../../helpers');

describe('postResendAnotherAccessCodePage', () => {
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
  });

  const mockLoginWithSignInOtp = api.loginWithSignInOtp as jest.Mock;
  const mockValidationErrorHandler = validationErrorHandler as jest.Mock;
  console.error = jest.fn();

  describe('when login status is not VALID_2FA', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '123456',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-123',
          numberOfSignInOtpAttemptsRemaining: 2,
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
        errRef: 'signInOTP',
      });
    });

    it('should render the new access code template with validation errors', () => {
      expect(renderMock).toHaveBeenCalledWith('login/resend-another-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        errors: { some: 'error' },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '123456',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-456',
          numberOfSignInOtpAttemptsRemaining: 3,
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

    it('should redirect to sign in link page', () => {
      expect(redirectMock).toHaveBeenCalledWith('/login/sign-in-link?t=new-user-token&u=user-from-response-id');
    });
  });

  describe('when an error occurs', () => {
    let req: PostResendAnotherAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          signInOTP: '123456',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-789',
          numberOfSignInOtpAttemptsRemaining: 1,
        },
      } as unknown as PostResendAnotherAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      await postResendAnotherAccessCodePage(req, res);
    });

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
