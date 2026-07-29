import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AuditDetails, AuditDatabaseRecord, InvalidUserIdError, InvalidSessionIdentifierError } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';

import { PortalUsersRepo } from '.';
import { mongoDbClient } from '../../drivers/db-client';

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');
const generateAuditDatabaseRecordFromAuditDetailsMock = jest.mocked(generateAuditDatabaseRecordFromAuditDetails);

const updateOneMock = jest.fn();
const getCollectionMock = jest.fn();

const userId = new ObjectId();

const auditDetails = generateSystemAuditDetails();

const auditDatabaseRecord: AuditDatabaseRecord = {
  lastUpdatedAt: '2024-01-01T00:00:00.000Z',
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
};

const sessionIdentifier = 'randomSessionIdentifier';

describe('PortalUsersRepo', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe('updateLastLoginAndResetSignInData', () => {
    const mockUpdateResult = { matchedCount: 1 };
    const expectedLastLogin = new Date('2024-01-01T00:00:00.000Z').getTime();

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      updateOneMock.mockResolvedValue(mockUpdateResult);

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
      });
      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      generateAuditDatabaseRecordFromAuditDetailsMock.mockReturnValue(auditDatabaseRecord);
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.USERS}`, async () => {
      // Act
      await PortalUsersRepo.updateLastLoginAndResetSignInData({ userId: userId.toString(), sessionIdentifier, auditDetails });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.USERS);
    });

    it('should call updateOne with the correct parameters', async () => {
      // Act
      await PortalUsersRepo.updateLastLoginAndResetSignInData({ userId: userId.toString(), sessionIdentifier, auditDetails });

      // Assert
      const setUpdate = {
        lastLogin: expectedLastLogin,
        loginFailureCount: 0,
        sessionIdentifier,
        auditRecord: auditDatabaseRecord,
        signInOTPSendCount: 0,
        signInOTPSendDate: 0,
        signInTokens: [],
      };

      expect(generateAuditDatabaseRecordFromAuditDetailsMock).toHaveBeenCalledWith(auditDetails);

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: { $eq: userId } },
        {
          $set: setUpdate,
        },
      );
    });

    it('should throw an error if an invalid userId is provided', async () => {
      // Arrange
      const invalidUserId = 'invalidUserId';

      // Act & Assert
      await expect(PortalUsersRepo.updateLastLoginAndResetSignInData({ userId: invalidUserId, sessionIdentifier, auditDetails })).rejects.toThrow(
        new InvalidUserIdError(invalidUserId.toString()),
      );
    });

    it('should throw an error if a sessionIdentifier is not provided', async () => {
      // Act & Assert
      await expect(PortalUsersRepo.updateLastLoginAndResetSignInData({ userId: userId.toString(), sessionIdentifier: '', auditDetails })).rejects.toThrow(
        new InvalidSessionIdentifierError(''),
      );
    });

    it('should throw an error if a database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database error';
      updateOneMock.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(PortalUsersRepo.updateLastLoginAndResetSignInData({ userId: userId.toString(), sessionIdentifier, auditDetails })).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
