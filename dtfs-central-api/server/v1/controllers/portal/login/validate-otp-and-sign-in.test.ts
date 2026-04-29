import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AuditDetails, issueValid2FAJWT, USER_STATUS } from '@ukef/dtfs2-common';
import { validateOTPAndSignIn } from './validate-otp-and-sign-in';
import { aPortalUser } from '../../../../../test-helpers';
import { validateOtp } from '../../../../helpers/portal-2fa/validate-otp';
import { PortalUsersRepo, getUserById } from '../../../../repositories/users-repo';

jest.mock('../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count');
jest.mock('../../../../repositories/users-repo');
jest.mock('../../../../helpers/portal-2fa/generate-otp');
jest.mock('../../../../helpers/portal-2fa/validate-otp');
jest.mock('@ukef/dtfs2-common');
jest.mock('@ukef/dtfs2-common/change-stream');

console.error = jest.fn();

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');

const auditDetails = generateSystemAuditDetails();

const user = { ...aPortalUser(), signInTokens: ['token'] };

const sessionIdentifier = 'sessionIdentifier';
const tokenObject = { token: 'token' };

const mockUpdateLastLoginAndResetSignInData = jest.fn();
const mockGetUserById = getUserById as jest.Mock;
const mockValidateOtp = validateOtp as jest.Mock;
const mockIssueValid2FAJWT = issueValid2FAJWT as jest.Mock;

const { req, res } = httpMocks.createMocks({
  body: { userId: 'userId', signInOTPCode: '123456', auditDetails },
});

describe('validateOTPAndSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(PortalUsersRepo, 'updateLastLoginAndResetSignInData').mockImplementation(mockUpdateLastLoginAndResetSignInData);

    mockUpdateLastLoginAndResetSignInData.mockResolvedValue(undefined);
    mockGetUserById.mockResolvedValue(user);
    mockIssueValid2FAJWT.mockReturnValue({ sessionIdentifier, ...tokenObject });
    mockValidateOtp.mockReturnValue({ success: true, isValid: true });
  });

  describe('when user is missing', () => {
    beforeEach(() => {
      mockGetUserById.mockResolvedValue(null);
    });

    it(`should return ${HttpStatusCode.NotFound} and a message`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({ message: 'User not found' });
    });

    it('should call console.error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to verify account sign in code - no account exists with the provided ID: %s', 'userId');
    });
  });

  describe('when the user is missing sign-in tokens', () => {
    beforeEach(() => {
      mockGetUserById.mockResolvedValue({ ...user, signInTokens: [] });
    });

    it(`should return ${HttpStatusCode.NotFound} and a message`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({ message: 'User not found' });
    });

    it('should call console.error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to verify account sign in code - no account exists with the provided ID: %s', 'userId');
    });
  });

  describe('when the user is blocked or disabled', () => {
    beforeEach(() => {
      mockGetUserById.mockResolvedValue({ ...user, 'user-status': USER_STATUS.BLOCKED, signInTokens: ['token'] });
    });

    it(`should return ${HttpStatusCode.Forbidden} and a message`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.Forbidden);
      expect(res._getData()).toEqual({ message: 'User is blocked or disabled' });
    });

    it('should call console.error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('User %s is blocked or disabled', user.email);
    });
  });

  describe('when the OTP is invalid', () => {
    const otpResponse = { success: false, isValid: false, statusCode: HttpStatusCode.Unauthorized, message: 'Invalid OTP' };

    beforeEach(() => {
      mockValidateOtp.mockReturnValue(otpResponse);
    });

    it(`should return the status code and response from validateOtp`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.Unauthorized);
      expect(res._getData()).toEqual(otpResponse);
    });

    it('should call console.error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to verify account sign in code for user %s', user.email);
    });
  });

  describe('when the OTP is valid', () => {
    it(`should return ${HttpStatusCode.Ok} with the user, token, and success flag`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({ user, tokenObject, success: true });
    });

    it('should call PortalUsersRepo.updateLastLoginAndResetSignInData with the correct params', async () => {
      await validateOTPAndSignIn(req, res);

      expect(mockUpdateLastLoginAndResetSignInData).toHaveBeenCalledTimes(1);
      expect(mockUpdateLastLoginAndResetSignInData).toHaveBeenCalledWith({ userId: 'userId', sessionIdentifier, auditDetails });
    });

    it('should call issueValid2FAJWT with the user', async () => {
      await validateOTPAndSignIn(req, res);

      expect(mockIssueValid2FAJWT).toHaveBeenCalledTimes(1);
      expect(mockIssueValid2FAJWT).toHaveBeenCalledWith(user);
    });

    it('should call validateOtp with the signInOTPCode and user', async () => {
      await validateOTPAndSignIn(req, res);

      expect(mockValidateOtp).toHaveBeenCalledTimes(1);
      expect(mockValidateOtp).toHaveBeenCalledWith('123456', user);
    });

    it('should not call console.error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('when there is an error', () => {
    const errorMessage = 'Test error';
    const error = new Error(errorMessage);

    beforeEach(() => {
      mockGetUserById.mockRejectedValue(error);
    });

    it(`should return ${HttpStatusCode.InternalServerError} and a message`, async () => {
      await validateOTPAndSignIn(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: errorMessage });
    });

    it('should call console.error with the error', async () => {
      await validateOTPAndSignIn(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error validating OTP and signing in user %s: %o', 'userId', error);
    });
  });
});
