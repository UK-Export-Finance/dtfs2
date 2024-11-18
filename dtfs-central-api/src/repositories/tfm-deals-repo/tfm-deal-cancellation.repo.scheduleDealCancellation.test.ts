import {
  DEAL_SUBMISSION_TYPE,
  DEAL_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
  TfmActivity,
  TfmDeal,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId, ModifyResult, WithoutId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { when } from 'jest-when';
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

const mockDeal = { dealSnapshot: { dealType: DEAL_TYPE.GEF } } as TfmDeal;

describe('tfm-deals-cancellation-repo', () => {
  const findOneAndUpdateMock = jest.fn();
  const findMock = jest.fn();
  const findToArrayMock = jest.fn();
  const getCollectionMock = jest.fn();

  const mockMatchedFacilities = [{ facilitySnapshot: { _id: new ObjectId() } }, { facilitySnapshot: { _id: new ObjectId() } }];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('scheduleDealCancellation', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      const mockModifyResult = { value: mockDeal } as ModifyResult<WithoutId<TfmDeal>>;
      findOneAndUpdateMock.mockResolvedValue(mockModifyResult);

      when(getCollectionMock).calledWith(MONGO_DB_COLLECTIONS.TFM_DEALS).mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock,
      });

      findToArrayMock.mockResolvedValue(mockMatchedFacilities);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      when(getCollectionMock).calledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES).mockResolvedValue({
        find: findMock,
      });

      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calls the DB with the correct collection names', async () => {
      // Act
      await TfmDealCancellationRepo.scheduleDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

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
        TfmDealCancellationRepo.scheduleDealCancellation({
          dealId: invalidDealId,
          cancellation: mockDealCancellationObject,
          auditDetails,
          activity: mockActivity,
        }),
      ).rejects.toThrow(new InvalidDealIdError(invalidDealId.toString()));
    });

    it('throws a DealNotFoundError if no matching deal is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { value: null } as ModifyResult<WithoutId<TfmDeal>>;

      findOneAndUpdateMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ findOneAndUpdate: findOneAndUpdateMock });

      // Assert
      await expect(
        TfmDealCancellationRepo.scheduleDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity }),
      ).rejects.toThrow(new DealNotFoundError(dealId.toString()));
    });

    describe('updating the deal stage', () => {
      it('calls findOneAndUpdate with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.scheduleDealCancellation({
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

        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
      });
    });

    describe('finding the matching facilities', () => {
      it('calls find with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.scheduleDealCancellation({
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
      const result = await TfmDealCancellationRepo.scheduleDealCancellation({
        dealId,
        cancellation: mockDealCancellationObject,
        auditDetails,
        activity: mockActivity,
      });

      // Assert
      expect(result).toEqual({ cancelledDeal: mockDeal, riskExpiredFacilities: mockMatchedFacilities });
    });
  });
});
