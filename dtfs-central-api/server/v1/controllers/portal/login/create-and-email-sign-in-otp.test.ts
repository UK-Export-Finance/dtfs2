import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { AuditDetails } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { createAndEmailSignInOTP } from './create-and-email-sign-in-otp';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { incrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';
import { sendSignInOtpEmail } from '../../../../helpers/portal-2fa/send-sign-in-otp-email';
import { sendAccountSuspensionEmail } from './send-account-suspension-email';
import { aPortalUser } from '../../../../../test-helpers';

jest.mock('../../../../helpers/portal-2fa/is-user-blocked-or-disabled');
jest.mock('../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count');
jest.mock('../../../../helpers/portal-2fa/generate-otp');
jest.mock('../../../../repositories/users-repo');
jest.mock('../../../../helpers/portal-2fa/send-sign-in-otp-email');
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

  let saveSignInOTPTokenForUserSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.mocked(isUserBlockedOrDisabled).mockReturnValue(false);
    jest.mocked(incrementSignInOTPSendCount).mockResolvedValue(2);
    jest.mocked(generateOtp).mockReturnValue({ securityCode: '123456', salt: 'salt-hex', hash: 'hash-hex', expiry: otpExpiry });
    jest.mocked(sendSignInOtpEmail).mockResolvedValue(undefined);
    jest.mocked(sendAccountSuspensionEmail).mockResolvedValue(undefined);

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
      const res = getMockResponse();

      await invokeController(body, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.NotFound);
    });
  });

  describe('when the user is blocked or disabled', () => {
    beforeEach(() => {
      jest.mocked(isUserBlockedOrDisabled).mockReturnValue(true);
    });

    it(`should respond with ${HttpStatusCode.Forbidden}`, async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Forbidden);
    });

    it('should not call incrementSignInOTPSendCount', async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(incrementSignInOTPSendCount).not.toHaveBeenCalled();
    });
  });

  describe('when incrementSignInOTPSendCount resolves -1', () => {
    beforeEach(() => {
      jest.mocked(incrementSignInOTPSendCount).mockResolvedValue(-1);
    });

    it(`should respond with ${HttpStatusCode.Created} and signInOTPSendCount -1`, async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
      expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: -1 });
    });

    it('should call sendAccountSuspensionEmail', async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(sendAccountSuspensionEmail).toHaveBeenNthCalledWith(1, user);
    });

    describe('and sendAccountSuspensionEmail throws', () => {
      beforeEach(() => {
        jest.mocked(sendAccountSuspensionEmail).mockRejectedValue(new Error('email failed'));
      });

      it(`should still respond with ${HttpStatusCode.Created} and signInOTPSendCount -1`, async () => {
        const res = getMockResponse();

        await invokeController({ user, auditDetails }, res);

        expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
        expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: -1 });
      });
    });
  });

  describe('on the happy path', () => {
    it('should call generateOtp, PortalUsersRepo.saveSignInOTPTokenForUser and sendSignInOtpEmail', async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(generateOtp).toHaveBeenCalledTimes(1);
      expect(saveSignInOTPTokenForUserSpy).toHaveBeenNthCalledWith(1, {
        userId: user._id.toString(),
        saltHex: 'salt-hex',
        hashHex: 'hash-hex',
        expiry: otpExpiry,
        auditDetails,
      });
      expect(sendSignInOtpEmail).toHaveBeenNthCalledWith(1, user, '123456');
    });

    it(`should respond with ${HttpStatusCode.Created} and the signInOTPSendCount`, async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Created);
      expect(res.send).toHaveBeenNthCalledWith(1, { signInOTPSendCount: 2 });
    });
  });

  describe('when an unexpected error is thrown', () => {
    beforeEach(() => {
      jest.mocked(incrementSignInOTPSendCount).mockRejectedValue(new Error('unexpected error'));
    });

    it(`should respond with ${HttpStatusCode.InternalServerError}`, async () => {
      const res = getMockResponse();

      await invokeController({ user, auditDetails }, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, { message: 'unexpected error' });
    });
  });

  describe('logging', () => {
    it('should sanitise the logged userId', async () => {
      const maliciousUser = { ...user, _id: `${user._id.toString()}!@#$%^&*()` };
      const res = getMockResponse();

      await invokeController({ user: maliciousUser, auditDetails }, res);

      expect(console.info).toHaveBeenNthCalledWith(1, 'Creating and emailing sign in OTP for user %s', user._id.toString());
    });
  });
});
