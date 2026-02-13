import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';

import { PostSubmitAccessCodePageRequest, postSubmitAccessCode } from './post-submit-access-code';
import * as api from '../../api';
import generateValidationErrors from './validation';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';

jest.mock('../../api');
jest.mock('./validation');
jest.mock('./validation/rules/incorrect-access-code');

describe('postCheckYourEmailAccessCodePage', () => {
  let res: Response;
  let renderMock: jest.Mock;
  let redirectMock: jest.Mock;

  const mockLoginWithSignInOtp = api.loginWithSignInOtp as jest.Mock;
  const mockGenerateValidationErrors = generateValidationErrors as jest.Mock;
  const mockIncorrectAccessCodeRule = incorrectAccessCodeRule as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    renderMock = jest.fn();
    redirectMock = jest.fn();
    res = {
      render: renderMock,
      redirect: redirectMock,
    } as unknown as Response;
    console.error = jest.fn();

    // Default mock returns no validation errors
    mockGenerateValidationErrors.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when login status is not VALID_2FA', () => {
    let req: PostSubmitAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
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
      } as unknown as PostSubmitAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });
      mockIncorrectAccessCodeRule.mockReturnValue({
        signInOTP: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });

      // Act
      await postSubmitAccessCode(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      // Assert
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer test-token',
        userId: 'user-abc',
        signInOTP: '654321',
      });
    });

    it('should render the check your email access code template with validation errors', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'test@example.com',
        signInOTP: '654321',
        validationErrors: {
          signInOTP: {
            text: 'The access code you have entered is incorrect',
            order: '1',
          },
        },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostSubmitAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
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
      } as unknown as PostSubmitAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      // Act
      await postSubmitAccessCode(req, res);
    });
    // Assert

    it('should call loginWithSignInOtp with correct arguments', () => {
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer valid-token',
        userId: 'user-def',
        signInOTP: '654321',
      });
    });

    it('should redirect to sign-in-link after successful OTP', () => {
      // Assert
      expect(redirectMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('when an error occurs', () => {
    let req: PostSubmitAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
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
      } as unknown as PostSubmitAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));
      mockIncorrectAccessCodeRule.mockReturnValue({
        signInOTP: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });

      // Act
      await postSubmitAccessCode(req, res);
    });
    // Assert

    it('should render the check your email access code template with validation errors for API errors (incorrect code)', () => {
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 1,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'err@example.com',
        signInOTP: '654321',
        validationErrors: {
          signInOTP: {
            text: 'The access code you have entered is incorrect',
            order: '1',
          },
        },
      });
    });
  });

  describe('when numberOfSignInOtpAttemptsRemaining is undefined', () => {
    let req: PostSubmitAccessCodePageRequest;
    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '654321',
        },
        session: {
          userToken: 'Bearer missing-attempts-token',
          userId: 'user-missing',
          userEmail: 'missing@example.com',
        },
      } as unknown as PostSubmitAccessCodePageRequest;

      // Act
      await postSubmitAccessCode(req, res);
    });

    it('should render the problem with service template', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when access code is empty', () => {
    let req: PostSubmitAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          signInOTP: '',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as PostSubmitAccessCodePageRequest;

      mockGenerateValidationErrors.mockReturnValue({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });

      // Act
      await postSubmitAccessCode(req, res);
    });

    it('should not call the API', () => {
      // Assert
      expect(mockLoginWithSignInOtp).not.toHaveBeenCalled();
    });

    it('should render the check your email access code template with validation errors', () => {
      // Assert
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'test@example.com',
        signInOTP: '',
        validationErrors: {
          signInOTP: {
            text: 'Enter the access code',
            order: '1',
          },
        },
      });
    });
  });
});
