import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AuditDetails, AuditDatabaseRecord, InvalidUserIdError } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';

import { PortalUsersRepo } from '.';
import { mongoDbClient } from '../../drivers/db-client';

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');
const generateAuditDatabaseRecordFromAuditDetailsMock = generateAuditDatabaseRecordFromAuditDetails as jest.MockedFunction<
  typeof generateAuditDatabaseRecordFromAuditDetails
>;

const findOneAndUpdateMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();
const getCollectionMock = jest.fn();

const userId = new ObjectId();

const auditDetails = generateSystemAuditDetails();

describe('PortalUsersRepo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('incrementSignInOTPSendCount', () => {
    beforeEach(() => {
      findOneAndUpdateMock.mockResolvedValue({});
      findToArrayMock.mockResolvedValue([]);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      getCollectionMock.mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock,
        find: findMock,
      });
      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      generateAuditDatabaseRecordFromAuditDetailsMock.mockReturnValue(auditDetails as unknown as AuditDatabaseRecord);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.USERS}`, async () => {
      // Act
      await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.USERS);
    });

    it('should call findOneAndUpdate with the correct parameters', async () => {
      // Act
      await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

      // Assert
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { _id: { $eq: userId } },
        { $inc: { signInOTPSendCount: 1 }, $set: { auditRecord: auditDetails } },
        { returnDocument: 'after' },
      );
    });

    it('should return the number of times the OTP has been sent', async () => {
      // Arrange
      findOneAndUpdateMock.mockResolvedValue({ value: { signInOTPSendCount: 2 } } as unknown as any[]);

      // Act
      const result = await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

      // Assert
      const expectedSignInOTPSendCount = 2;

      expect(result).toBe(expectedSignInOTPSendCount);
    });

    it('should throw an error if an invalid userId is provided', async () => {
      // Arrange
      const invalidUserId = 'invalidUserId';

      // Act & Assert
      await expect(PortalUsersRepo.incrementSignInOTPSendCount(invalidUserId, auditDetails)).rejects.toThrow(new InvalidUserIdError(invalidUserId.toString()));
    });

    it('should throw an error if a database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database error';
      findOneAndUpdateMock.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails)).rejects.toThrow(errorMessage);
    });
  });
});
