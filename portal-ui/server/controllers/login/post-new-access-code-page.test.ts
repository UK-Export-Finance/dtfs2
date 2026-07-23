import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';

import { PostNewAccessCodePageRequest, postNewAccessCodePage } from './post-new-access-code-page';
import * as api from '../../api';
import generateValidationErrors from './validation';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';

jest.mock('../../api');
jest.mock('./validation');
jest.mock('./validation/rules/incorrect-access-code');

describe('postNewAccessCodePage', () => {
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
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'test@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({ loginStatus: 'INVALID' });
      mockIncorrectAccessCodeRule.mockReturnValue({
        sixDigitAccessCode: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });

      // Act
      await postNewAccessCodePage(req, res);
    });

    it('should call loginWithSignInOtp with correct arguments', () => {
      // Assert
      expect(mockLoginWithSignInOtp).toHaveBeenCalledWith({
        token: 'Bearer test-token',
        userId: 'user-abc',
        signInOTP: '654321',
      });
    });

    it('should render the new access code template with validation errors', () => {
      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/new-access-code.njk', {
        attemptsLeft: 1,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: 'test@example.com',
        sixDigitAccessCode: '654321',
        validationErrors: {
          sixDigitAccessCode: {
            text: 'The access code you have entered is incorrect',
            order: '1',
          },
        },
        accessCodeError: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });
    });
  });

  describe('when login status is VALID_2FA', () => {
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer valid-token',
          userId: 'user-def',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'valid@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        token: 'new-user-token',
        user: { _id: 'user-from-response-id' },
      });

      // Act
      await postNewAccessCodePage(req, res);
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

  describe('when OTP result is EXPIRED', () => {
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '123456',
        },
        session: {
          userToken: 'Bearer expired-token',
          userId: 'user-expired',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'expired@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      // Mock the API to return EXPIRED result
      mockLoginWithSignInOtp.mockImplementation(() => {
        return { isExpired: true };
      });

      // Act
      await postNewAccessCodePage(req, res);
    });

    it('should redirect once', () => {
      // Assert
      expect(redirectMock).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /login/access-code-expired', () => {
      // Assert
      expect(redirectMock).toHaveBeenCalledWith('/login/access-code-expired');
    });
  });

  describe('when the API rejects with a 401 Unauthorized error (wrong access code)', () => {
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: { sixDigitAccessCode: '111111' },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'test@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockIncorrectAccessCodeRule.mockReturnValue({
        sixDigitAccessCode: { text: 'The access code you have entered is incorrect', order: '1' },
      });

      const axiosError = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: HttpStatusCode.Unauthorized },
      });

      mockLoginWithSignInOtp.mockRejectedValue(axiosError);

      await postNewAccessCodePage(req, res);
    });

    it('should render the template with an incorrect-code validation error', () => {
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/new-access-code.njk', {
        attemptsLeft: 1,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: 'test@example.com',
        sixDigitAccessCode: '111111',
        validationErrors: {
          sixDigitAccessCode: { text: 'The access code you have entered is incorrect', order: '1' },
        },
        accessCodeError: { text: 'The access code you have entered is incorrect', order: '1' },
      });
    });

    it('should not render the problem with service page', () => {
      expect(renderMock).not.toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when an error occurs', () => {
    let req: PostNewAccessCodePageRequest;
    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer error-token',
          userId: 'user-err',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'err@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockLoginWithSignInOtp.mockRejectedValue(new Error('API error'));

      // Act
      await postNewAccessCodePage(req, res);
    });
    // Assert

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when login response is missing required fields after successful OTP validation', () => {
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      req = {
        body: {
          sixDigitAccessCode: '654321',
        },
        session: {
          userToken: 'Bearer missing-fields-token',
          userId: 'user-missing-fields',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'missing-fields@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockLoginWithSignInOtp.mockResolvedValue({
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        user: { _id: 'user-missing-fields' },
      });

      await postNewAccessCodePage(req, res);
    });

    it('should log a specific error before throwing', () => {
      expect(console.error).toHaveBeenCalledWith(
        'Missing user token, login status, or user details after successful OTP validation for user %s',
        'user-missing-fields',
      );
    });

    it('should render the problem with service template', () => {
      expect(renderMock).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when numberOfSignInOtpAttemptsRemaining is not 1', () => {
    describe('when it is undefined', () => {
      let req: PostNewAccessCodePageRequest;
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
        } as unknown as PostNewAccessCodePageRequest;

        // Act
        await postNewAccessCodePage(req, res);
      });

      it('should redirect to /not-found', () => {
        // Assert
        expect(redirectMock).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('when access code is empty', () => {
    let req: PostNewAccessCodePageRequest;

    beforeEach(async () => {
      // Arrange
      req = {
        body: {
          sixDigitAccessCode: '',
        },
        session: {
          userToken: 'Bearer test-token',
          userId: 'user-abc',
          numberOfSignInOtpAttemptsRemaining: 1,
          userEmail: 'test@example.com',
        },
      } as unknown as PostNewAccessCodePageRequest;

      mockGenerateValidationErrors.mockReturnValue({
        sixDigitAccessCode: {
          text: 'Enter access code',
          order: '1',
        },
      });

      // Act
      await postNewAccessCodePage(req, res);
    });

    it('should not call the API', () => {
      // Assert
      expect(mockLoginWithSignInOtp).not.toHaveBeenCalled();
    });

    it('should render the new access code template with validation errors', () => {
      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(renderMock).toHaveBeenCalledWith('login/new-access-code.njk', {
        attemptsLeft: 1,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: 'test@example.com',
        sixDigitAccessCode: '',
        validationErrors: {
          sixDigitAccessCode: {
            text: 'Enter access code',
            order: '1',
          },
        },
        accessCodeError: {
          text: 'Enter access code',
          order: '1',
        },
      });
    });
  });
});
