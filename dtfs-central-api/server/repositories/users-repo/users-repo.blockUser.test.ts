import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AuditDetails, InvalidUserIdError, USER_STATUS } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';

import { PortalUsersRepo } from '.';
import { mongoDbClient } from '../../drivers/db-client';

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');
const generateAuditDatabaseRecordFromAuditDetailsMock = jest.mocked(generateAuditDatabaseRecordFromAuditDetails);

const updateOneMock = jest.fn();
const getCollectionMock = jest.fn();

const userId = new ObjectId();

const reason = 'block user';

const auditDetails = generateSystemAuditDetails();

const auditDatabaseRecord = {
  lastUpdatedAt: '2024-01-01T00:00:00.000Z',
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
};

describe('PortalUsersRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('blockUser', () => {
    const mockUpdateResult = { matchedCount: 1 };

    beforeEach(() => {
      updateOneMock.mockResolvedValue(mockUpdateResult);

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
      });
      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      generateAuditDatabaseRecordFromAuditDetailsMock.mockReturnValue(auditDatabaseRecord);
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.USERS}`, async () => {
      // Act
      await PortalUsersRepo.blockUser({ userId: userId.toString(), reason, auditDetails });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.USERS);
    });

    it('should call updateOne with the correct parameters', async () => {
      // Act
      await PortalUsersRepo.blockUser({ userId: userId.toString(), reason, auditDetails });

      // Assert
      expect(generateAuditDatabaseRecordFromAuditDetailsMock).toHaveBeenCalledWith(auditDetails);

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: { $eq: userId } },
        {
          $set: {
            'user-status': USER_STATUS.BLOCKED,
            blockedStatusReason: reason,
            auditRecord: auditDatabaseRecord,
          },
        },
      );
    });

    it('should throw an error if an invalid userId is provided', async () => {
      // Arrange
      const invalidUserId = 'xyz';

      // Assert
      await expect(PortalUsersRepo.blockUser({ userId: invalidUserId, reason, auditDetails })).rejects.toThrow(
        new InvalidUserIdError(invalidUserId.toString()),
      );
    });

    it('should throw an error if a database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database error';
      updateOneMock.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(PortalUsersRepo.blockUser({ userId: userId.toString(), reason, auditDetails })).rejects.toThrow(errorMessage);
    });
  });
});
