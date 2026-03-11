import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AuditDetails, AuditDatabaseRecord, InvalidUserIdError, OTP } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';

import { PortalUsersRepo } from '.';
import { mongoDbClient } from '../../drivers/db-client';

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');
const generateAuditDatabaseRecordFromAuditDetailsMock = generateAuditDatabaseRecordFromAuditDetails as jest.MockedFunction<
  typeof generateAuditDatabaseRecordFromAuditDetails
>;

const updateOneMock = jest.fn();
const getCollectionMock = jest.fn();

const userId = new ObjectId();

const saltHex = 'randomSaltHex';
const hashHex = 'randomHashedHex';
const expiry = Date.now() + 3600000; // 1 hour from now

const auditDetails = generateSystemAuditDetails();

describe('PortalUsersRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('saveSignInOTPTokenForUser', () => {
    const mockUpdateResult = { matchedCount: 1 };

    beforeEach(() => {
      updateOneMock.mockResolvedValue(mockUpdateResult);

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
      });
      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      generateAuditDatabaseRecordFromAuditDetailsMock.mockReturnValue(auditDetails as unknown as AuditDatabaseRecord);
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.USERS}`, async () => {
      // Act
      await PortalUsersRepo.saveSignInOTPTokenForUser({ userId: userId.toString(), saltHex, hashHex, expiry, auditDetails });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.USERS);
    });

    it('should call updateOne with the correct parameters', async () => {
      // Act
      await PortalUsersRepo.saveSignInOTPTokenForUser({ userId: userId.toString(), saltHex, hashHex, expiry, auditDetails });

      // Assert
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: { $eq: userId } },
        {
          $push: { signInTokens: { $each: [{ hashHex, saltHex, expiry }], $slice: -OTP.MAX_SIGN_IN_ATTEMPTS } },
          $set: {
            auditRecord: generateAuditDatabaseRecordFromAuditDetailsMock(auditDetails),
          },
        },
      );
    });

    it('should throw an error if an invalid userId is provided', async () => {
      // Arrange
      const invalidUserId = 'invalidUserId';

      // Act & Assert
      await expect(PortalUsersRepo.saveSignInOTPTokenForUser({ userId: invalidUserId, saltHex, hashHex, expiry, auditDetails })).rejects.toThrow(
        new InvalidUserIdError(invalidUserId),
      );
    });

    it('should throw an error if a database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database error';
      updateOneMock.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(PortalUsersRepo.saveSignInOTPTokenForUser({ userId: userId.toString(), saltHex, hashHex, expiry, auditDetails })).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
