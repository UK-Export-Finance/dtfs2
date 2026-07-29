import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuditDetails, issueValid2FAJWT } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { validateOTPAndSignIn } from './validate-otp-and-sign-in';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { validateOtp } from '../../../../helpers/portal-2fa/validate-otp';
import { getUserById, PortalUsersRepo } from '../../../../repositories/users-repo';
import { aPortalUser } from '../../../../../test-helpers';

jest.mock('@ukef/dtfs2-common', (): typeof import('@ukef/dtfs2-common') => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  issueValid2FAJWT: jest.fn(),
}));

jest.mock('../../../../helpers/portal-2fa/is-user-blocked-or-disabled');
jest.mock('../../../../helpers/portal-2fa/validate-otp');
jest.mock('../../../../repositories/users-repo');

type MockResponse = Partial<Response> & {
  status: jest.Mock;
  send: jest.Mock;
};

const getMockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn(),
    send: jest.fn(),
  };

  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);

  return res;
};

const invokeController = async (body: Record<string, unknown>, res: MockResponse) => {
  const req = { body } as Parameters<typeof validateOTPAndSignIn>[0];

  await validateOTPAndSignIn(req, res as Response);
};

describe('validateOTPAndSignIn', () => {
  const userId = '507f1f77bcf86cd799439011';
  const signInOTPCode = '123456';
  const auditDetails: AuditDetails = generatePortalAuditDetails(userId);
  const signedInUser = { ...aPortalUser(), _id: new ObjectId(userId), signInTokens: [{ hashHex: 'hash', saltHex: 'salt', expiry: Date.now() + 1000 }] };

  let updateLastLoginAndResetSignInDataSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.mocked(getUserById).mockResolvedValue(signedInUser);
    jest.mocked(isUserBlockedOrDisabled).mockReturnValue(false);
    jest.mocked(validateOtp).mockReturnValue({ success: true, isValid: true, statusCode: HttpStatusCode.Ok });
    jest.mocked(issueValid2FAJWT).mockReturnValue({ token: 'jwt-token', expires: '12h', sessionIdentifier: 'session-id' });

    updateLastLoginAndResetSignInDataSpy = jest.spyOn(PortalUsersRepo, 'updateLastLoginAndResetSignInData').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('when getUserById rejects because the user does not exist', () => {
    beforeEach(() => {
      jest.mocked(getUserById).mockRejectedValue(new Error(`Failed to find user with id ${userId}`));
    });

    it(`should respond with ${HttpStatusCode.InternalServerError} and the not found error message`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: `Failed to find user with id ${userId}` });
    });
  });

  describe('when the user has no signInTokens', () => {
    beforeEach(() => {
      jest.mocked(getUserById).mockResolvedValue({ ...signedInUser, signInTokens: [] });
    });

    it(`should respond with ${HttpStatusCode.NotFound}`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.NotFound);
    });
  });

  describe('when the user is blocked or disabled', () => {
    beforeEach(() => {
      jest.mocked(isUserBlockedOrDisabled).mockReturnValue(true);
    });

    it(`should respond with ${HttpStatusCode.Forbidden}`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Forbidden);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: 'User is blocked or disabled' });
    });
  });

  describe('when validateOtp returns an unsuccessful result', () => {
    it('should respond with Unauthorized when the OTP is expired', async () => {
      jest.mocked(validateOtp).mockReturnValue({ success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized });
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Unauthorized);
      expect(res.send).toHaveBeenNthCalledWith(1, { success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized });
    });

    it('should respond with Unauthorized when the OTP is invalid', async () => {
      jest.mocked(validateOtp).mockReturnValue({ success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized });
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Unauthorized);
      expect(res.send).toHaveBeenNthCalledWith(1, { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized });
    });

    it('should respond with NotFound when the OTP is not found', async () => {
      jest.mocked(validateOtp).mockReturnValue({ success: false, notFound: true, statusCode: HttpStatusCode.NotFound });
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.NotFound);
      expect(res.send).toHaveBeenNthCalledWith(1, { success: false, notFound: true, statusCode: HttpStatusCode.NotFound });
    });
  });

  describe('when the OTP is valid', () => {
    it('should call issueValid2FAJWT and PortalUsersRepo.updateLastLoginAndResetSignInData', async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(issueValid2FAJWT).toHaveBeenNthCalledWith(1, signedInUser);
      expect(updateLastLoginAndResetSignInDataSpy).toHaveBeenNthCalledWith(1, { userId, sessionIdentifier: 'session-id', auditDetails });
    });

    it(`should respond with ${HttpStatusCode.Ok} and the user/tokenObject/success flag`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Ok);
      expect(res.send).toHaveBeenNthCalledWith(1, { user: signedInUser, tokenObject: { token: 'jwt-token', expires: '12h' }, success: true });
    });
  });

  describe('when an unexpected Error is thrown', () => {
    beforeEach(() => {
      jest.mocked(getUserById).mockRejectedValue(new Error('unexpected error'));
    });

    it(`should respond with ${HttpStatusCode.InternalServerError} and the error message`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: 'unexpected error' });
    });
  });

  describe('when a non-Error is thrown', () => {
    beforeEach(() => {
      jest.mocked(getUserById).mockRejectedValue('not an error instance');
    });

    it(`should respond with ${HttpStatusCode.InternalServerError} and a generic message`, async () => {
      const res = getMockResponse();

      await invokeController({ userId, signInOTPCode, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: 'An unexpected error occurred' });
    });
  });

  describe('logging', () => {
    it('should sanitise the logged userId', async () => {
      const maliciousUserId = `${userId}\n\r!@#$%^&*()`;
      const sanitisedUserId = maliciousUserId.replace(/[^a-zA-Z0-9_-]/g, '');
      jest.mocked(getUserById).mockResolvedValue({ ...signedInUser, signInTokens: [] });

      const res = getMockResponse();

      await invokeController({ userId: maliciousUserId, signInOTPCode, auditDetails }, res);

      expect(console.info).toHaveBeenNthCalledWith(1, 'Validating OTP and signing in user %s', sanitisedUserId);
      expect(console.error).toHaveBeenNthCalledWith(1, 'Unable to verify account sign in code - no account exists with the provided ID: %s', sanitisedUserId);
    });
  });
});
