import {
  DEAL_SUBMISSION_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';
import { aTfmUser } from '../../../test-helpers';

const dealId = new ObjectId();

const mockBankRequestDate = getUnixTime(new Date('2024-01-01'));
const mockEffectiveFrom = getUnixTime(new Date('2025-02-02'));
const mockReason = 'mock reason';

const mockDealCancellationObject = { reason: mockReason, bankRequestDate: mockBankRequestDate, effectiveFrom: mockEffectiveFrom };

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

  describe('submitDealCancellation', () => {
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
      await TfmDealCancellationRepo.submitDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledTimes(1);
    });

    it('throws an InvalidDealIdError if deal is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(TfmDealCancellationRepo.submitDealCancellation(invalidDealId, mockDealCancellationObject, auditDetails)).rejects.toThrow(
        new InvalidDealIdError(invalidDealId.toString()),
      );
    });

    it('throws a DealNotFoundError if no matching result is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { matchedCount: 0 };

      updateOneMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ updateOne: updateOneMock });

      // Assert
      await expect(TfmDealCancellationRepo.submitDealCancellation(dealId, mockDealCancellationObject, auditDetails)).rejects.toThrow(
        new DealNotFoundError(dealId.toString()),
      );
    });

    it('calls updateOne with the expected parameters', async () => {
      // Act
      await TfmDealCancellationRepo.submitDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      const expectedFilter = {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.cancellation.reason': { $eq: mockReason },
        'tfm.cancellation.bankRequestDate': { $eq: mockBankRequestDate },
        'tfm.cancellation.effectiveFrom': { $eq: mockEffectiveFrom },
      };
      const expectedUpdate = flatten({
        'tfm.stage': TFM_DEAL_STAGE.CANCELLED,
        'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      });

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
    });

    it('returns the deal cancellation response object', async () => {
      // Act
      const result = await TfmDealCancellationRepo.submitDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      expect(result).toEqual({ cancelledDealUkefId: dealId });
    });
  });
});
