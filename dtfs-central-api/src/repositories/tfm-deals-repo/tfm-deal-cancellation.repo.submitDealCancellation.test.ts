import {
  DEAL_SUBMISSION_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
  TfmActivity,
  TFM_FACILITY_STAGE,
  TfmDeal,
  DEAL_TYPE,
} from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId, ModifyResult, WithoutId, UpdateResult } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';

const dealId = new ObjectId();

const mockDeal = { dealSnapshot: { dealType: DEAL_TYPE.GEF } } as TfmDeal;

const mockBankRequestDate = getUnixTime(new Date('2024-01-01'));
const mockEffectiveFrom = getUnixTime(new Date('2025-02-02'));
const mockReason = 'mock reason';

const mockDealCancellationObject = { reason: mockReason, bankRequestDate: mockBankRequestDate, effectiveFrom: mockEffectiveFrom };

const tfmUserId = aTfmUser()._id;

const auditDetails = generateTfmAuditDetails(tfmUserId);

const mockActivity = { text: 'This is an activity' } as TfmActivity;

describe('tfm-deals-cancellation-repo', () => {
  const findOneAndUpdateMock = jest.fn();
  const updateManyMock = jest.fn();
  const findMock = jest.fn();
  const findToArrayMock = jest.fn();
  const getCollectionMock = jest.fn();

  const mockMatchedFacilities = [{ facilitySnapshot: { _id: new ObjectId() } }, { facilitySnapshot: { _id: new ObjectId() } }];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('submitDealCancellation', () => {
    const mockUpdateResult = { matchedCount: 1 } as UpdateResult;
    const mockModifyResult = { value: mockDeal } as ModifyResult<WithoutId<TfmDeal>>;
    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      findOneAndUpdateMock.mockResolvedValue(mockModifyResult);
      updateManyMock.mockResolvedValue(mockUpdateResult);
      findToArrayMock.mockResolvedValue(mockMatchedFacilities);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      getCollectionMock.mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock,
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
      await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

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
        TfmDealCancellationRepo.submitDealCancellation({
          dealId: invalidDealId,
          cancellation: mockDealCancellationObject,
          auditDetails,
          activity: mockActivity,
        }),
      ).rejects.toThrow(new InvalidDealIdError(invalidDealId.toString()));
    });

    it('throws a DealNotFoundError if no matching deal is found', async () => {
      // Arrange
      const mockFailedModifyResult = { value: null } as ModifyResult<WithoutId<TfmDeal>>;

      findOneAndUpdateMock.mockResolvedValue(mockFailedModifyResult);

      getCollectionMock.mockResolvedValue({ findOneAndUpdate: findOneAndUpdateMock });

      // Assert
      await expect(
        TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity }),
      ).rejects.toThrow(new DealNotFoundError(dealId.toString()));
    });

    describe('updating the deal stage', () => {
      it('calls findOneAndUpdate with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

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
            'tfm.stage': TFM_DEAL_STAGE.CANCELLED,
            'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
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

    describe('updating and finding the matching facilities', () => {
      it('calls updateMany with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

        // Assert
        const expectedFilter = {
          'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
        };
        const expectedUpdate = flatten({
          'tfm.facilityStage': TFM_FACILITY_STAGE.RISK_EXPIRED,
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        });

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(updateManyMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
      });

      it('calls find with the expected parameters', async () => {
        // Act
        await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation: mockDealCancellationObject, auditDetails, activity: mockActivity });

        // Assert
        const expectedFilter = {
          'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
        };

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith(expectedFilter);
      });
    });

    it('returns the deal cancellation response object with the deal ids and corresponding facility ids', async () => {
      // Act
      const result = await TfmDealCancellationRepo.submitDealCancellation({
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
