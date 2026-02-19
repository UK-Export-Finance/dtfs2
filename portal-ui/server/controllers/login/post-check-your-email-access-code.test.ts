import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';

import { PostCheckYourEmailAccessCodePageRequest, postCheckYourEmailAccessCode } from './post-check-your-email-access-code';
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
  let statusMock: jest.Mock;

  const mockLoginWithSignInOtp = api.loginWithSignInOtp as jest.Mock;
  const mockGenerateValidationErrors = generateValidationErrors as jest.Mock;
  const mockIncorrectAccessCodeRule = incorrectAccessCodeRule as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    renderMock = jest.fn();
    redirectMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    res = {
      render: renderMock,
      redirect: redirectMock,
      status: statusMock,
    } as unknown as Response;
    console.error = jest.fn();

    // Default mock returns no validation errors
    mockGenerateValidationErrors.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when login status is not VALID_2FA', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });
      mockIncorrectAccessCodeRule.mockReturnValue({
        sixDigitAccessCode: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });

      // Act
      await postCheckYourEmailAccessCode(req, res);
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
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'test@example.com',
        sixDigitAccessCode: '654321',
        validationErrors: {
          sixDigitAccessCode: {
            text: 'The access code you have entered is incorrect',
            order: '1',
          },
        },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-def',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'valid@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      // Act
      await postCheckYourEmailAccessCode(req, res);
    });
    // Assert

    it('should call loginWithSignInOtp with correct arguments', () => {
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

  describe('when the API rejects with a 401 Unauthorized error (wrong access code)', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: { sixDigitAccessCode: '111111' },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockIncorrectAccessCodeRule.mockReturnValue({
        sixDigitAccessCode: { text: 'The access code you have entered is incorrect', order: '1' },
      });

      const axiosError = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: HttpStatusCode.Unauthorized },
      });

      mockLoginWithSignInOtp.mockRejectedValue(axiosError);

      await postCheckYourEmailAccessCode(req, res);
    });

    it('should render the template with an incorrect-code validation error', () => {
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'test@example.com',
        sixDigitAccessCode: '111111',
        validationErrors: {
          sixDigitAccessCode: { text: 'The access code you have entered is incorrect', order: '1' },
        },
      });
    });

    it('should not render the problem with service page', () => {
      expect(renderMock).not.toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when an error occurs', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;
    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-err',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'err@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      // Act
      await postCheckYourEmailAccessCode(req, res);
    });
    // Assert

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when numberOfSignInOtpAttemptsRemaining is not 2', () => {
    describe('when it is undefined', () => {
      let req: PostCheckYourEmailAccessCodePageRequest;
      beforeEach(async () => {
        // Arrange
        req = {
          body: {
            sixDigitAccessCode: '654321',
          },
          session: {
            userToken: 'Bearer missing-attempts-token',
            userId: 'user-missing',
            userEmail: 'missing@example.com',
          },
        } as unknown as PostCheckYourEmailAccessCodePageRequest;

        // Act
        await postCheckYourEmailAccessCode(req, res);
      });

      it('should redirect to /not-found', () => {
        // Assert
        expect(redirectMock).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when it is 1 (new-access-code page)', () => {
      let req: PostCheckYourEmailAccessCodePageRequest;
      beforeEach(async () => {
        // Arrange — attemptsLeft === 1 means getNextAccessCodePage routes the user to
        // /login/new-access-code, so this POST handler should never be reached
        req = {
          body: {
            sixDigitAccessCode: '654321',
          },
          session: {
            userToken: 'Bearer wrong-page-token',
            userId: 'user-wrong-page',
            numberOfSignInOtpAttemptsRemaining: 1,
            userEmail: 'wrong@example.com',
          },
        } as unknown as PostCheckYourEmailAccessCodePageRequest;

        // Act
        await postCheckYourEmailAccessCode(req, res);
      });

      it('should redirect to /not-found', () => {
        // Assert
        expect(redirectMock).toHaveBeenCalledWith('/not-found');
      });

      it('should not call the API', () => {
        // Assert
        expect(mockLoginWithSignInOtp).not.toHaveBeenCalled();
      });
    });
  });

  describe('when access code is empty', () => {
    let req: PostCheckYourEmailAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 2,
          userEmail: 'test@example.com',
        },
      } as unknown as PostCheckYourEmailAccessCodePageRequest;

      mockGenerateValidationErrors.mockReturnValue({
        sixDigitAccessCode: {
          text: 'Enter the access code',
          order: '1',
        },
      });

      // Act
      await postCheckYourEmailAccessCode(req, res);
    });

    it('should not call the API', () => {
      // Assert
      expect(mockLoginWithSignInOtp).not.toHaveBeenCalled();
    });

    it('should render the check your email access code template with validation errors', () => {
      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/new-access-code',
        email: 'test@example.com',
        sixDigitAccessCode: '',
        validationErrors: {
          sixDigitAccessCode: {
            text: 'Enter the access code',
            order: '1',
          },
        },
      });
    });
  });
});
