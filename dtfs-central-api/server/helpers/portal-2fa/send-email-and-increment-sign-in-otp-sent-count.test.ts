import { HttpStatusCode } from 'axios';
import { OTP, AuditDetails, STATUS_BLOCKED_REASON } from '@ukef/dtfs2-common';
import { sendEmailAndIncrementSignInOTPSendCount } from './send-email-and-increment-sign-in-otp-sent-count';
import { PortalUsersRepo } from '../../repositories/users-repo';
import { sendSignInOtpEmail } from './send-sign-in-otp-email';
import { aPortalUser } from '../../../test-helpers';

jest.mock('@ukef/dtfs2-common/change-stream');
jest.mock('../../repositories/users-repo');
jest.mock('./send-sign-in-otp-email');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');

describe('sendEmailAndIncrementSignInOTPSendCount', () => {
  const mockIncrementSignInOTPSendCount = jest.fn();
  const mockSetSignInOTPSendDate = jest.fn();
  const mockBlockUser = jest.fn();
  const mockSendSignInOtpEmail = jest.mocked(sendSignInOtpEmail);

  const makeVariables = (overrides?: Partial<Parameters<typeof sendEmailAndIncrementSignInOTPSendCount>[0]>) => ({
    user: { ...aPortalUser(), signInOTPSendCount: 0 },
    securityCode: '123456',
    auditDetails: generateSystemAuditDetails(),
    ...overrides,
  });

  beforeEach(() => {
    mockIncrementSignInOTPSendCount.mockReset();
    mockSetSignInOTPSendDate.mockReset();
    mockBlockUser.mockReset();
    mockSendSignInOtpEmail.mockReset();

    mockSendSignInOtpEmail.mockResolvedValue({
      status: Number(HttpStatusCode.Created),
      data: {} as never,
    });

    PortalUsersRepo.incrementSignInOTPSendCount = mockIncrementSignInOTPSendCount;
    PortalUsersRepo.setSignInOTPSendDate = mockSetSignInOTPSendDate;
    PortalUsersRepo.blockUser = mockBlockUser;

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when increment returns first attempt', () => {
    const variables = makeVariables();
    const userId = variables.user._id.toString();

    beforeEach(() => {
      mockIncrementSignInOTPSendCount.mockResolvedValue(1);
      mockSetSignInOTPSendDate.mockResolvedValue(null);
    });

    it('should call sendSignInOtpEmail', async () => {
      // Act
      await sendEmailAndIncrementSignInOTPSendCount(variables);

      // Assert
      expect(mockSendSignInOtpEmail).toHaveBeenNthCalledWith(1, variables.user, variables.securityCode);
    });

    it('should call PortalUsersRepo.incrementSignInOTPSendCount', async () => {
      // Act
      await sendEmailAndIncrementSignInOTPSendCount(variables);

      // Assert
      expect(mockIncrementSignInOTPSendCount).toHaveBeenNthCalledWith(1, userId, variables.auditDetails);
    });

    it('should call PortalUsersRepo.setSignInOTPSendDate', async () => {
      // Act
      await sendEmailAndIncrementSignInOTPSendCount(variables);

      // Assert
      expect(mockSetSignInOTPSendDate).toHaveBeenNthCalledWith(1, { userId, auditDetails: variables.auditDetails });
    });

    it('should not call PortalUsersRepo.blockUser', async () => {
      // Act
      await sendEmailAndIncrementSignInOTPSendCount(variables);

      // Assert
      expect(mockBlockUser).not.toHaveBeenCalled();
    });

    it('should return the correct number of remaining attempts', async () => {
      // Act
      const remainingAttempts = await sendEmailAndIncrementSignInOTPSendCount(variables);

      // Assert
      expect(remainingAttempts).toEqual(OTP.MAX_SIGN_IN_ATTEMPTS - 1);
    });
  });

  it('should not send an email when current send count is already at max', async () => {
    // Arrange
    const variables = makeVariables({ user: { ...aPortalUser(), signInOTPSendCount: OTP.MAX_SIGN_IN_ATTEMPTS } });
    const userId = variables.user._id.toString();

    mockIncrementSignInOTPSendCount.mockResolvedValue(OTP.MAX_SIGN_IN_ATTEMPTS + 1);

    // Act
    await sendEmailAndIncrementSignInOTPSendCount(variables);

    // Assert
    expect(mockSendSignInOtpEmail).not.toHaveBeenCalled();
    expect(mockIncrementSignInOTPSendCount).toHaveBeenNthCalledWith(1, userId, variables.auditDetails);
  });

  it('should block the user when attempts exceed the maximum allowed attempts', async () => {
    // Arrange
    const variables = makeVariables();
    const userId = variables.user._id.toString();

    mockIncrementSignInOTPSendCount.mockResolvedValue(OTP.MAX_SIGN_IN_ATTEMPTS + 1);

    // Act
    await sendEmailAndIncrementSignInOTPSendCount(variables);

    // Assert
    expect(mockBlockUser).toHaveBeenNthCalledWith(1, {
      userId,
      reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_OTPS,
      auditDetails: variables.auditDetails,
    });
  });

  it(`should throw when email send response status is not ${HttpStatusCode.Created}`, async () => {
    // Arrange
    const variables = makeVariables();

    mockSendSignInOtpEmail.mockResolvedValue({
      status: Number(HttpStatusCode.InternalServerError),
      data: {} as never,
    });

    // Act
    await expect(sendEmailAndIncrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

    // Assert
    expect(mockIncrementSignInOTPSendCount).not.toHaveBeenCalled();
  });

  it('should throw an error when incrementing count returns null', async () => {
    // Arrange
    const variables = makeVariables();

    mockIncrementSignInOTPSendCount.mockResolvedValue(null);

    // Act + Assert
    await expect(sendEmailAndIncrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');
  });

  describe('error handling', () => {
    describe('when PortalUsersRepo.setSignInOTPSendDate throws an error', () => {
      const mockError = new Error('Database error');
      const variables = makeVariables();

      beforeEach(() => {
        mockIncrementSignInOTPSendCount.mockResolvedValue(1);
        mockSetSignInOTPSendDate.mockRejectedValue(mockError);
      });

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(sendEmailAndIncrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenNthCalledWith(1, 'Error incrementing sign in OTP send count for user %s: %o', variables.user._id.toString(), mockError);
      });
    });

    describe('when PortalUsersRepo.blockUser throws an error', () => {
      const mockError = new Error('Database error');
      const variables = makeVariables();

      beforeEach(() => {
        mockIncrementSignInOTPSendCount.mockResolvedValue(OTP.MAX_SIGN_IN_ATTEMPTS + 1);
        mockBlockUser.mockRejectedValue(mockError);
      });

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(sendEmailAndIncrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenNthCalledWith(1, 'Error incrementing sign in OTP send count for user %s: %o', variables.user._id.toString(), mockError);
      });
    });
  });
});
