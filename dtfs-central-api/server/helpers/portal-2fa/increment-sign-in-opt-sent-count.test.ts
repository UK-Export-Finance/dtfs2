import { OTP, AuditDetails, STATUS_BLOCKED_REASON } from '@ukef/dtfs2-common';
import { incrementSignInOTPSendCount } from './increment-sign-in-opt-sent-count';
import { PortalUsersRepo } from '../../repositories/users-repo';

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');

jest.mock('../../repositories/users-repo');
console.error = jest.fn();

describe('incrementSignInOTPSendCount', () => {
  const mockResetSignInData = jest.fn();
  const mockIncrementSignInOTPSendCount = jest.fn();
  const mockSetSignInOTPSendDate = jest.fn();
  const mockBlockUser = jest.fn();

  beforeEach(() => {
    PortalUsersRepo.resetSignInData = mockResetSignInData;
    PortalUsersRepo.incrementSignInOTPSendCount = mockIncrementSignInOTPSendCount;
    PortalUsersRepo.setSignInOTPSendDate = mockSetSignInOTPSendDate;
    PortalUsersRepo.blockUser = mockBlockUser;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when sign in data is stale and incrementSignInOTPSendCount returns 1', () => {
    beforeEach(() => {
      mockResetSignInData.mockResolvedValue(null);
      mockIncrementSignInOTPSendCount.mockResolvedValue(1);
      mockSetSignInOTPSendDate.mockResolvedValue(null);
    });

    const variables = {
      userId: 'user-id',
      signInOTPSendDate: new Date(Date.now() - OTP.TIME_TO_RESET_SIGN_IN_OTP_SEND_COUNT_IN_MILLISECONDS - 1000),
      auditDetails: generateSystemAuditDetails(),
    };

    it('should call PortalUsersRepo.resetSignInData', async () => {
      // Act
      await incrementSignInOTPSendCount(variables);

      // Assert
      expect(mockResetSignInData).toHaveBeenCalledTimes(1);
      expect(mockResetSignInData).toHaveBeenCalledWith(variables);
    });

    it('should call PortalUsersRepo.incrementSignInOTPSendCount', async () => {
      // Act
      await incrementSignInOTPSendCount(variables);

      // Assert
      expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledTimes(1);
      expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledWith(variables.userId, variables.auditDetails);
    });

    it('should call PortalUsersRepo.setSignInOTPSendDate', async () => {
      // Act
      await incrementSignInOTPSendCount(variables);

      // Assert
      expect(mockSetSignInOTPSendDate).toHaveBeenCalledTimes(1);
      expect(mockSetSignInOTPSendDate).toHaveBeenCalledWith({ userId: variables.userId, auditDetails: variables.auditDetails });
    });

    it('should return the correct number of remaining attempts', async () => {
      // Act
      const remainingAttempts = await incrementSignInOTPSendCount(variables);

      // Assert
      expect(remainingAttempts).toEqual(OTP.MAX_SIGN_IN_ATTEMPTS - 1);
    });

    it('should not call PortalUsersRepo.blockUser', async () => {
      // Act
      await incrementSignInOTPSendCount(variables);

      // Assert
      expect(mockBlockUser).toHaveBeenCalledTimes(0);
    });
  });

  describe('when sign in data is not stale', () => {
    describe('when incrementSignInOTPSendCount returns 1', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(1);
        mockSetSignInOTPSendDate.mockResolvedValue(null);
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should not call PortalUsersRepo.resetSignInData', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockResetSignInData).toHaveBeenCalledTimes(0);
      });

      it('should call PortalUsersRepo.incrementSignInOTPSendCount', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledTimes(1);
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledWith(variables.userId, variables.auditDetails);
      });

      it('should call PortalUsersRepo.setSignInOTPSendDate', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockSetSignInOTPSendDate).toHaveBeenCalledTimes(1);
        expect(mockSetSignInOTPSendDate).toHaveBeenCalledWith({ userId: variables.userId, auditDetails: variables.auditDetails });
      });

      it('should return the correct number of remaining attempts', async () => {
        // Act
        const remainingAttempts = await incrementSignInOTPSendCount(variables);

        // Assert
        expect(remainingAttempts).toEqual(OTP.MAX_SIGN_IN_ATTEMPTS - 1);
      });

      it('should not call PortalUsersRepo.blockUser', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockBlockUser).toHaveBeenCalledTimes(0);
      });
    });

    describe('when incrementSignInOTPSendCount returns 2', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(2);
        mockSetSignInOTPSendDate.mockResolvedValue(null);
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should not call PortalUsersRepo.resetSignInData', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockResetSignInData).toHaveBeenCalledTimes(0);
      });

      it('should call PortalUsersRepo.incrementSignInOTPSendCount', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledTimes(1);
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledWith(variables.userId, variables.auditDetails);
      });

      it('should not call PortalUsersRepo.setSignInOTPSendDate', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockSetSignInOTPSendDate).toHaveBeenCalledTimes(0);
      });

      it('should return the correct number of remaining attempts', async () => {
        // Act
        const remainingAttempts = await incrementSignInOTPSendCount(variables);

        // Assert
        expect(remainingAttempts).toEqual(OTP.MAX_SIGN_IN_ATTEMPTS - 2);
      });

      it('should not call PortalUsersRepo.blockUser', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockBlockUser).toHaveBeenCalledTimes(0);
      });
    });

    describe('when incrementSignInOTPSendCount returns 3', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(3);
        mockSetSignInOTPSendDate.mockResolvedValue(null);
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should not call PortalUsersRepo.resetSignInData', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockResetSignInData).toHaveBeenCalledTimes(0);
      });

      it('should call PortalUsersRepo.incrementSignInOTPSendCount', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledTimes(1);
        expect(mockIncrementSignInOTPSendCount).toHaveBeenCalledWith(variables.userId, variables.auditDetails);
      });

      it('should not call PortalUsersRepo.setSignInOTPSendDate', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockSetSignInOTPSendDate).toHaveBeenCalledTimes(0);
      });

      it('should return the correct number of remaining attempts', async () => {
        // Act
        const remainingAttempts = await incrementSignInOTPSendCount(variables);

        // Assert
        expect(remainingAttempts).toEqual(OTP.MAX_SIGN_IN_ATTEMPTS - 3);
      });

      it('should not call PortalUsersRepo.blockUser', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockBlockUser).toHaveBeenCalledTimes(0);
      });
    });

    describe('when incrementSignInOTPSendCount returns more than the maximum allowed attempts', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(OTP.MAX_SIGN_IN_ATTEMPTS + 1);
        mockSetSignInOTPSendDate.mockResolvedValue(null);
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should call PortalUsersRepo.blockUser', async () => {
        // Act
        await incrementSignInOTPSendCount(variables);

        // Assert
        expect(mockBlockUser).toHaveBeenCalledTimes(1);
        expect(mockBlockUser).toHaveBeenCalledWith({
          userId: variables.userId,
          reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_OTPS,
          auditDetails: variables.auditDetails,
        });
      });
    });
  });

  describe('error handling', () => {
    describe('when PortalUsersRepo.incrementSignInOTPSendCount throws an error', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockRejectedValue(new Error('Database error'));
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(incrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error incrementing sign in OTP send count for user %s: %o', variables.userId, new Error('Database error'));
      });
    });

    describe('when PortalUsersRepo.incrementSignInOTPSendCount returns null', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(null);
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(incrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          'Error incrementing sign in OTP send count for user %s: %o',
          variables.userId,
          new Error('Failed to increment sign in OTP send count'),
        );
      });
    });

    describe('when PortalUsersRepo.resetSignInData throws an error', () => {
      beforeEach(() => {
        mockResetSignInData.mockRejectedValue(new Error('Database error'));
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(Date.now() - OTP.TIME_TO_RESET_SIGN_IN_OTP_SEND_COUNT_IN_MILLISECONDS - 1000),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(incrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error incrementing sign in OTP send count for user %s: %o', variables.userId, new Error('Database error'));
      });
    });

    describe('when PortalUsersRepo.setSignInOTPSendDate throws an error', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(1);
        mockSetSignInOTPSendDate.mockRejectedValue(new Error('Database error'));
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(incrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error incrementing sign in OTP send count for user %s: %o', variables.userId, new Error('Database error'));
      });
    });

    describe('when PortalUsersRepo.blockUser throws an error', () => {
      beforeEach(() => {
        mockResetSignInData.mockResolvedValue(null);
        mockIncrementSignInOTPSendCount.mockResolvedValue(OTP.MAX_SIGN_IN_ATTEMPTS + 1);
        mockSetSignInOTPSendDate.mockResolvedValue(null);
        mockBlockUser.mockRejectedValue(new Error('Database error'));
      });

      const variables = {
        userId: 'user-id',
        signInOTPSendDate: new Date(),
        auditDetails: generateSystemAuditDetails(),
      };

      it('should log the error and throw a new error', async () => {
        // Act
        await expect(incrementSignInOTPSendCount(variables)).rejects.toThrow('Error incrementing sign in OTP send count');

        // Assert
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error incrementing sign in OTP send count for user %s: %o', variables.userId, new Error('Database error'));
      });
    });
  });
});
