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

  describe('setSignInOTPSendDate', () => {
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
      await PortalUsersRepo.setSignInOTPSendDate({ userId: userId.toString(), auditDetails });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.USERS);
    });

    it('should call findOneAndUpdate with the correct parameters', async () => {
      // Act
      await PortalUsersRepo.setSignInOTPSendDate({ userId: userId.toString(), auditDetails });

      // Assert
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { _id: { $eq: userId } },
        { $set: { signInOTPSendDate: expect.any(Number) as unknown, auditRecord: auditDetails } },
        { returnDocument: 'after' },
      );
    });

    it('should return the updated signInOTPSendDate', async () => {
      // Arrange
      const expectedSignInOTPSendDate = Date.now();
      findOneAndUpdateMock.mockResolvedValue({ value: { signInOTPSendDate: expectedSignInOTPSendDate } });

      // Act
      const result = await PortalUsersRepo.setSignInOTPSendDate({ userId: userId.toString(), auditDetails });

      // Assert
      expect(result).toBe(expectedSignInOTPSendDate);
    });

    it('should return null if the user is not found', async () => {
      // Arrange
      findOneAndUpdateMock.mockResolvedValue({ value: null });

      // Act
      const result = await PortalUsersRepo.setSignInOTPSendDate({ userId: userId.toString(), auditDetails });

      // Assert
      expect(result).toBeNull();
    });

    it('should throw an error if a database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database error';
      findOneAndUpdateMock.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(PortalUsersRepo.setSignInOTPSendDate({ userId: userId.toString(), auditDetails })).rejects.toThrow(errorMessage);
    });

    it('should throw an error if an invalid userId is provided', async () => {
      // Arrange
      const invalidUserId = 'invalidUserId';

      // Act & Assert
      await expect(PortalUsersRepo.setSignInOTPSendDate({ userId: invalidUserId, auditDetails })).rejects.toThrow(
        new InvalidUserIdError(invalidUserId.toString()),
      );
    });
  });
});
