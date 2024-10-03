import { DEAL_SUBMISSION_TYPE, DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TFM_DEAL_STAGE } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';
import { aTfmUser } from '../../../test-helpers';

const dealId = new ObjectId();

const tfmUserId = aTfmUser()._id;

const auditDetails = generateTfmAuditDetails(tfmUserId);

describe('tfm-deals-cancellation-repo', () => {
  const updateOneMock = jest.fn();
  const getCollectionMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1727876437063);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('deleteOneDealCancellation', () => {
    const mockUpdateResult = { matchedCount: 1 };

    beforeEach(() => {
      updateOneMock.mockResolvedValue(mockUpdateResult);

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('calls the DB with the correct collection name', async () => {
      // Act
      await TfmDealCancellationRepo.deleteOneDealCancellation(dealId, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledTimes(1);
    });

    it('throws an InvalidDealIdError if deal is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(TfmDealCancellationRepo.deleteOneDealCancellation(invalidDealId, auditDetails)).rejects.toThrow(
        new InvalidDealIdError(invalidDealId.toString()),
      );
    });

    it('throws a DealNotFoundError if no matching result is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { matchedCount: 0 };

      updateOneMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ updateOne: updateOneMock });

      // Assert
      await expect(TfmDealCancellationRepo.deleteOneDealCancellation(dealId, auditDetails)).rejects.toThrow(new DealNotFoundError(dealId.toString()));
    });

    it('calls updateOne with the expected parameters', async () => {
      // Act
      await TfmDealCancellationRepo.deleteOneDealCancellation(dealId, auditDetails);

      // Assert
      const expectedFilter = {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
      };
      const expectedUpdate = { $unset: { 'tfm.cancellation': '' }, $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) } };

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
    });
  });
});
