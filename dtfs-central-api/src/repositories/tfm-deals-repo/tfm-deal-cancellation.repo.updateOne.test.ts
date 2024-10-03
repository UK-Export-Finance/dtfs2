import { DEAL_SUBMISSION_TYPE, DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TFM_DEAL_STAGE } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';
import { aTfmUser } from '../../../test-helpers';

const dealId = new ObjectId();

const mockDealCancellationObject = { reason: 'test reason', bankRequestDate: getUnixTime(new Date()), effectiveFrom: getUnixTime(new Date()) };

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

  describe('updateOneDealCancellation', () => {
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
      await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalled();
    });

    it('throws an InvalidDealIdError if deal is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(TfmDealCancellationRepo.updateOneDealCancellation(invalidDealId, mockDealCancellationObject, auditDetails)).rejects.toThrow(
        new InvalidDealIdError(invalidDealId.toString()),
      );
    });

    it('throws a DealNotFoundError if no matching result is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { matchedCount: 0 };

      updateOneMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ updateOne: updateOneMock });

      // Assert
      await expect(TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject, auditDetails)).rejects.toThrow(
        new DealNotFoundError(dealId.toString()),
      );
    });

    it('calls updateOne with the expected parameters', async () => {
      // Act
      await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      const expectedFilter = {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
      };
      const expectedUpdate = flatten({
        'tfm.cancellation': mockDealCancellationObject,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      });

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
    });

    it('returns the deal cancellation update', async () => {
      // Act
      const result = await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
