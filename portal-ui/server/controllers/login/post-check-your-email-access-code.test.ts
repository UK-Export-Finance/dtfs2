import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { AccessCodePageRequest } from '../../types/2fa/sign-in-access-code-types';
import { postSubmitSignInOtp } from './post-check-your-email-access-code';
import * as api from '../../api';
import { validationErrorHandler } from '../../helpers';

jest.mock('../../api');
jest.mock('../../helpers');

describe('postSubmitSignInOtp', () => {
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
  const mockValidationErrorHandler = validationErrorHandler as jest.Mock;

  describe('when login status is not VALID_2FA', () => {
    let req: AccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '654321',
          accessCode: '',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as AccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });
      mockValidationErrorHandler.mockReturnValue({ some: 'error' });

      // Act
      await postSubmitSignInOtp(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      // Assert
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer test-token',
        userId: 'user-abc',
        signInOTP: '654321',
      });
    });

    it('should call validationErrorHandler with correct arguments', () => {
      // Assert
      expect(mockValidationErrorHandler).toHaveBeenCalledWith({
        errMsg: 'The access code you have entered is incorrect',
        errRef: 'signInOTP',
      });
    });

    it('should render the check your email access code template with validation errors', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/request-new-access-code',
        email: 'test@example.com',
        errors: { some: 'error' },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: AccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '654321',
          accessCode: '',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-def',
          numberOfSignInOtpAttemptsRemaining: 3,
          userEmail: 'valid@example.com',
        },
      } as unknown as AccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      // Act
      await postSubmitSignInOtp(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      // Assert
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer valid-token',
        userId: 'user-def',
        signInOTP: '654321',
      });
    });

    it('should redirect to dashboard after successful OTP', () => {
      // Assert
      expect(redirectMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('when an error occurs', () => {
    let req: AccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '654321',
          accessCode: '',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-err',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'err@example.com',
        },
      } as unknown as AccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      // Act
      await postSubmitSignInOtp(req, res);
    });

    it('should render the problem with service template', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when numberOfSignInOtpAttemptsRemaining is undefined', () => {
    let req: AccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '654321',
          accessCode: '',
        },
        session: {
          userToken: 'Bearer missing-attempts-token',
          userId: 'user-missing',
          userEmail: 'missing@example.com',
        },
      } as unknown as AccessCodePageRequest;

      // Act
      await postSubmitSignInOtp(req, res);
    });

    it('should render the problem with service template', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });
});
