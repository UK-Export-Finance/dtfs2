import {
  DEAL_SUBMISSION_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
  TfmActivity,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
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

const mockActivity = { text: 'This is an activity' } as TfmActivity;

describe('tfm-deals-cancellation-repo', () => {
  const updateOneMock = jest.fn();
  const updateManyMock = jest.fn();
  const findMock = jest.fn();
  const findToArrayMock = jest.fn();
  const getCollectionMock = jest.fn();

  const matchingFacilityId1 = new ObjectId();
  const matchingFacilityId2 = new ObjectId();

  const mockMatchedFacilities = [{ facilitySnapshot: { ukefFacilityId: matchingFacilityId1 } }, { facilitySnapshot: { ukefFacilityId: matchingFacilityId2 } }];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('submitScheduledDealCancellation', () => {
    const mockUpdateResult = { matchedCount: 1 };

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      updateOneMock.mockResolvedValue(mockUpdateResult);
      findToArrayMock.mockResolvedValue(mockMatchedFacilities);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
        updateMany: updateManyMock,
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calls the DB with the correct collection names', async () => {
      // Act
      await TfmDealCancellationRepo.submitScheduledDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(2);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('throws an InvalidDealIdError if deal id is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(
        TfmDealCancellationRepo.submitScheduledDealCancellation({
          dealId: invalidDealId,
          cancellation: mockDealCancellationObject,
          auditDetails,
          activity: mockActivity,
        }),
      ).rejects.toThrow(new InvalidDealIdError(invalidDealId.toString()));
    });

    it('throws a DealNotFoundError if no matching deal is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { matchedCount: 0 };

      updateOneMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ updateOne: updateOneMock });

      // Assert
      await expect(
        TfmDealCancellationRepo.submitScheduledDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity }),
      ).rejects.toThrow(new DealNotFoundError(dealId.toString()));
    });

    describe('updating the deal stage', () => {
      it('calls updateOne with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.submitScheduledDealCancellation({
          dealId,
          cancellation: mockDealCancellationObject,
          auditDetails,
          activity: mockActivity,
        });

        // Assert
        const expectedFilter = {
          _id: { $eq: new ObjectId(dealId) },
          'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
          'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
          'tfm.cancellation.reason': { $eq: mockReason },
          'tfm.cancellation.bankRequestDate': { $eq: mockBankRequestDate },
          'tfm.cancellation.effectiveFrom': { $eq: mockEffectiveFrom },
        };
        const expectedUpdate = {
          $set: {
            'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.SCHEDULED,
            auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
          },
          $push: {
            'tfm.activities': mockActivity,
          },
        };

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
      });
    });

    describe('finding the matching facilities', () => {
      it('calls find with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.submitScheduledDealCancellation({
          dealId,
          cancellation: mockDealCancellationObject,
          auditDetails,
          activity: mockActivity,
        });

        // Assert
        const expectedFilter = {
          'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
        };

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith(expectedFilter);
      });
    });

    it('returns the deal cancellation response object with the deal id and corresponding facility ids', async () => {
      // Act
      const result = await TfmDealCancellationRepo.submitScheduledDealCancellation({
        dealId,
        cancellation: mockDealCancellationObject,
        auditDetails,
        activity: mockActivity,
      });

      // Assert
      expect(result).toEqual({ cancelledDealUkefId: dealId, riskExpiredFacilityUkefIds: [matchingFacilityId1, matchingFacilityId2] });
    });
  });
});
