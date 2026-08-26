import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { AuditDetails } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { createAndEmailSignInOTP } from './create-and-email-sign-in-otp';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { sendEmailAndIncrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/send-email-and-increment-sign-in-otp-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';
import { sendAccountSuspensionEmail } from './send-account-suspension-email';
import { isSignInDataStale } from '../../../../helpers/portal-2fa/is-sign-in-data-stale';
import { aPortalUser } from '../../../../../test-helpers';

jest.mock('../../../../helpers/portal-2fa/is-user-blocked-or-disabled');
jest.mock('../../../../helpers/portal-2fa/send-email-and-increment-sign-in-otp-sent-count');
jest.mock('../../../../helpers/portal-2fa/generate-otp');
jest.mock('../../../../helpers/portal-2fa/is-sign-in-data-stale');
jest.mock('../../../../repositories/users-repo');
jest.mock('./send-account-suspension-email');

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
  const req = { body } as Parameters<typeof createAndEmailSignInOTP>[0];
  await createAndEmailSignInOTP(req, res as Response);
};

describe('createAndEmailSignInOTP', () => {
  const user = aPortalUser();
  const auditDetails: AuditDetails = generatePortalAuditDetails(user._id);
  const otpExpiry = Date.now() + 1000;

  let resetSignInDataSpy: jest.SpyInstance;
  let saveSignInOTPTokenForUserSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.mocked(isUserBlockedOrDisabled).mockReturnValue(false);
    jest.mocked(isSignInDataStale).mockReturnValue(false);
    jest.mocked(sendEmailAndIncrementSignInOTPSendCount).mockResolvedValue(2);
    jest.mocked(generateOtp).mockReturnValue({ securityCode: '123456', salt: 'salt-hex', hash: 'hash-hex', expiry: otpExpiry });
    jest.mocked(sendAccountSuspensionEmail).mockResolvedValue(undefined);

    resetSignInDataSpy = jest.spyOn(PortalUsersRepo, 'resetSignInData').mockResolvedValue(undefined);
    saveSignInOTPTokenForUserSpy = jest.spyOn(PortalUsersRepo, 'saveSignInOTPTokenForUser').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  /**
   * Verifies that the controller rejects requests where the user or auditDetails payload is missing required fields.
   */
  describe('when the user or auditDetails is missing required fields', () => {
    it.each([
      { description: 'user is undefined', body: { auditDetails } },
      { description: 'auditDetails is undefined', body: { user } },
      { description: 'user._id is missing', body: { user: { ...user, _id: undefined }, auditDetails } },
      { description: 'user.email is missing', body: { user: { ...user, email: undefined }, auditDetails } },
      { description: 'user.firstname is missing', body: { user: { ...user, firstname: undefined }, auditDetails } },
      { description: 'user.surname is missing', body: { user: { ...user, surname: undefined }, auditDetails } },
    ])(`should respond with ${HttpStatusCode.NotFound} when $description`, async ({ body }) => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController(body, res);

      // Assert
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.NotFound);
    });
  });

  describe('when the user is blocked or disabled', () => {
    beforeEach(() => {
      jest.mocked(isUserBlockedOrDisabled).mockReturnValue(true);
    });

    it(`should respond with ${HttpStatusCode.Forbidden}`, async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Forbidden);
    });

    it('should not call sendEmailAndIncrementSignInOTPSendCount', async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(sendEmailAndIncrementSignInOTPSendCount).not.toHaveBeenCalled();
    });
  });

  describe('when sendEmailAndIncrementSignInOTPSendCount resolves -1', () => {
    beforeEach(() => {
      jest.mocked(sendEmailAndIncrementSignInOTPSendCount).mockResolvedValue(-1);
    });

    it(`should respond with ${HttpStatusCode.Created} and signInOTPSendCount -1`, async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
      expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: -1 });
    });

    it('should call sendAccountSuspensionEmail', async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(sendAccountSuspensionEmail).toHaveBeenNthCalledWith(1, user);
    });

    describe('and sendAccountSuspensionEmail throws', () => {
      beforeEach(() => {
        jest.mocked(sendAccountSuspensionEmail).mockRejectedValue(new Error('email failed'));
      });

      it(`should still respond with ${HttpStatusCode.Created} and signInOTPSendCount -1`, async () => {
        // Arrange
        const res = getMockResponse();

        // Act
        await invokeController({ user, auditDetails }, res);

        // Assert
        expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
        expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: -1 });
      });
    });
  });

  describe('on the happy path', () => {
    it('should call generateOtp, sendEmailAndIncrementSignInOTPSendCount and PortalUsersRepo.saveSignInOTPTokenForUser', async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(generateOtp).toHaveBeenCalledTimes(1);
      expect(sendEmailAndIncrementSignInOTPSendCount).toHaveBeenNthCalledWith(1, {
        user,
        securityCode: '123456',
        auditDetails,
      });
      expect(saveSignInOTPTokenForUserSpy).toHaveBeenNthCalledWith(1, {
        userId: user._id.toString(),
        saltHex: 'salt-hex',
        hashHex: 'hash-hex',
        expiry: otpExpiry,
        auditDetails,
      });
    });

    it(`should respond with ${HttpStatusCode.Created} and the signInOTPSendCount`, async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
      expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: 2 });
    });
  });

  describe('when sign in data is stale', () => {
    it('should call PortalUsersRepo.resetSignInData before creating OTP', async () => {
      // Arrange
      const staleSignInDate = new Date('2024-01-01T00:00:00.000Z');
      const userWithStaleData = { ...user, signInOTPSendDate: staleSignInDate };
      const res = getMockResponse();

      jest.mocked(isSignInDataStale).mockReturnValue(true);

      // Act
      await invokeController({ user: userWithStaleData, auditDetails }, res);

      // Assert
      expect(resetSignInDataSpy).toHaveBeenNthCalledWith(1, {
        userId: user._id.toString(),
        signInOTPSendDate: staleSignInDate,
        auditDetails,
      });
      expect(sendEmailAndIncrementSignInOTPSendCount).toHaveBeenNthCalledWith(1, {
        user: { ...userWithStaleData, signInOTPSendCount: 0 },
        securityCode: '123456',
        auditDetails,
      });
    });
  });

  describe('when sign in data is not stale', () => {
    it('should not call PortalUsersRepo.resetSignInData', async () => {
      // Arrange
      const res = getMockResponse();

      jest.mocked(isSignInDataStale).mockReturnValue(false);

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(resetSignInDataSpy).not.toHaveBeenCalled();
    });
  });

  describe('when an unexpected error is thrown', () => {
    beforeEach(() => {
      jest.mocked(sendEmailAndIncrementSignInOTPSendCount).mockRejectedValue(new Error('unexpected error'));
    });

    it(`should respond with ${HttpStatusCode.InternalServerError}`, async () => {
      // Arrange
      const res = getMockResponse();

      // Act
      await invokeController({ user, auditDetails }, res);

      // Assert
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: 'unexpected error' });
    });
  });

  describe('logging', () => {
    it('should sanitise the logged userId', async () => {
      // Arrange
      const maliciousUser = { ...user, _id: `${user._id.toString()}!@#$%^&*()` };
      const res = getMockResponse();

      // Act
      await invokeController({ user: maliciousUser, auditDetails }, res);

      // Assert
      expect(console.info).toHaveBeenNthCalledWith(1, 'Creating and emailing sign in OTP for user %s', user._id.toString());
    });
  });
});
