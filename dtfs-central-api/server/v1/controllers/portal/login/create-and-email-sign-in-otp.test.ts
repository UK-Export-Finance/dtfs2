import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AuditDetails, USER_STATUS, isProduction } from '@ukef/dtfs2-common';
import { createAndEmailSignInOTP } from './create-and-email-sign-in-otp';
import { aPortalUser } from '../../../../../test-helpers';
import { incrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count';
import { PortalUsersRepo } from '../../../../repositories/users-repo';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';

jest.mock('../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count');
jest.mock('../../../../repositories/users-repo');
jest.mock('../../../../helpers/portal-2fa/generate-otp');
jest.mock('@ukef/dtfs2-common');
jest.mock('@ukef/dtfs2-common/change-stream');

console.error = jest.fn();
console.info = jest.fn();

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');

const auditDetails = generateSystemAuditDetails();

const user = aPortalUser();

const mockIncrementSignInOTPSendCount = incrementSignInOTPSendCount as jest.Mock;
const mockGenerateOtp = generateOtp as jest.Mock;
const mockIsProduction = isProduction as jest.Mock;
const mockSaveSignInOTPTokenForUser = jest.fn();

const securityCode = '123456';
const salt = 'saltHex';
const hash = 'hashHex';
const expiry = new Date(Date.now() + 5 * 60 * 1000);

describe('createAndEmailSignInOTP', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(PortalUsersRepo, 'saveSignInOTPTokenForUser').mockImplementation(mockSaveSignInOTPTokenForUser);

    mockIncrementSignInOTPSendCount.mockResolvedValue(1);
    mockSaveSignInOTPTokenForUser.mockResolvedValue(undefined);
    mockGenerateOtp.mockReturnValue({ securityCode, salt, hash, expiry });
    mockIsProduction.mockReturnValue(false);
  });

  describe('when user is missing', () => {
    const { req, res } = httpMocks.createMocks({
      body: { user: null, auditDetails },
    });

    it(`should return ${HttpStatusCode.NotFound} and a message`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({ message: 'User or auditDetails not found' });
    });

    it('should call console.error', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('User or auditDetails not found');
    });
  });

  describe('when user is missing properties', () => {
    const incompleteUser = { ...user, email: undefined };

    const { req, res } = httpMocks.createMocks({
      body: { user: incompleteUser, auditDetails },
    });

    it(`should return ${HttpStatusCode.NotFound} and a message`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({ message: 'User or auditDetails not found' });
    });

    it('should call console.error', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('User or auditDetails not found');
    });
  });

  describe('when auditDetails is missing', () => {
    const { req, res } = httpMocks.createMocks({
      body: { user, auditDetails: null },
    });

    it(`should return ${HttpStatusCode.NotFound} and a message`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({ message: 'User or auditDetails not found' });
    });

    it('should call console.error', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('User or auditDetails not found');
    });
  });

  describe('when user is blocked or disabled', () => {
    const blockedUser = { ...user, 'user-status': USER_STATUS.BLOCKED };

    const { req, res } = httpMocks.createMocks({
      body: { user: blockedUser, auditDetails },
    });

    it(`should return ${HttpStatusCode.Forbidden} and a message`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.Forbidden);
      expect(res._getData()).toEqual({ message: 'User is blocked or disabled' });
    });

    it('should call console.error', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('User %s is blocked or disabled', user._id);
    });
  });

  describe('when user is valid', () => {
    const { req, res } = httpMocks.createMocks({
      body: { user, auditDetails },
    });

    it(`should return ${HttpStatusCode.Created} and the signInOTPSendCount`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
      expect(res._getData()).toEqual({ signInOTPSendCount: 1 });
    });

    it('should call incrementSignInOTPSendCount with correct params', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledTimes(1);
      expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledWith({
        userId: user._id.toString(),
        signInOTPSendDate: undefined,
        auditDetails,
      });
    });

    it('should call PortalUsersRepo.saveSignInOTPTokenForUser with correct params', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(mockSaveSignInOTPTokenForUser).toHaveBeenCalledTimes(1);

      expect(mockSaveSignInOTPTokenForUser).toHaveBeenCalledWith({
        userId: user._id.toString(),
        saltHex: salt,
        hashHex: hash,
        expiry,
        auditDetails,
      });
    });

    it('should log the OTP code to the console in non-production environments', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.info).toHaveBeenCalledWith('Sign in OTP code for user: %s is: %s', user.email, securityCode);
    });

    it('should NOT log the OTP code to the console in production environments', async () => {
      mockIsProduction.mockReturnValue(true);

      await createAndEmailSignInOTP(req, res);

      expect(console.info).not.toHaveBeenCalledWith('Sign in OTP code for user: %s is: %s', user.email, securityCode);
    });
  });

  describe('when an error is thrown', () => {
    const errorMessage = 'Test error';
    const { req, res } = httpMocks.createMocks({
      body: { user, auditDetails },
    });

    beforeEach(() => {
      mockIncrementSignInOTPSendCount.mockRejectedValue(new Error(errorMessage));
    });

    it(`should return ${HttpStatusCode.InternalServerError} and a message`, async () => {
      await createAndEmailSignInOTP(req, res);

      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: errorMessage });
    });

    it('should call console.error with the error', async () => {
      await createAndEmailSignInOTP(req, res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Failed to create and email sign in OTP for user %s: %o', user._id, new Error(errorMessage));
    });
  });
});
