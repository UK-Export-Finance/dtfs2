import { DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TfmActivity, TfmDeal, DEAL_TYPE } from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId, ModifyResult, WithoutId, UpdateResult } from 'mongodb';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmActivitiesRepo } from './tfm-activities.repo';

const dealId = new ObjectId();

const mockDeal = { dealSnapshot: { dealType: DEAL_TYPE.GEF } } as TfmDeal;

const tfmUserId = aTfmUser()._id;

const auditDetails = generateTfmAuditDetails(tfmUserId);

const mockActivity = { text: 'This is an activity' } as TfmActivity;

describe('tfm-activities-repo', () => {
  const findOneAndUpdateMock = jest.fn();
  const updateManyMock = jest.fn();
  const findMock = jest.fn();
  const findToArrayMock = jest.fn();
  const getCollectionMock = jest.fn();

  const mockMatchedFacilities = [{ facilitySnapshot: { _id: new ObjectId() } }, { facilitySnapshot: { _id: new ObjectId() } }];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('submitTfmActivity', () => {
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

    it('should call the DB with the correct collection names', async () => {
      // Act
      await TfmActivitiesRepo.submitTfmActivity({ dealId, auditDetails, activity: mockActivity });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
    });

    it('should throw an InvalidDealIdError if deal id is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(
        TfmActivitiesRepo.submitTfmActivity({
          dealId: invalidDealId,
          auditDetails,
          activity: mockActivity,
        }),
      ).rejects.toThrow(new InvalidDealIdError(invalidDealId.toString()));
    });

    it('should throw a DealNotFoundError if no matching deal is found', async () => {
      // Arrange
      const mockFailedModifyResult = { value: null } as ModifyResult<WithoutId<TfmDeal>>;

      findOneAndUpdateMock.mockResolvedValue(mockFailedModifyResult);

      getCollectionMock.mockResolvedValue({ findOneAndUpdate: findOneAndUpdateMock });

      // Assert
      await expect(TfmActivitiesRepo.submitTfmActivity({ dealId, auditDetails, activity: mockActivity })).rejects.toThrow(
        new DealNotFoundError(dealId.toString()),
      );
    });

    describe('updating the deal stage', () => {
      it('should call findOneAndUpdate with the expected parameters', async () => {
        // Act
        await TfmActivitiesRepo.submitTfmActivity({ dealId, auditDetails, activity: mockActivity });

        // Assert
        const expectedFilter = {
          _id: { $eq: new ObjectId(dealId) },
        };

        const expectedUpdate = {
          $set: {
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

    it('should return the deal response object', async () => {
      // Act
      const result = await TfmActivitiesRepo.submitTfmActivity({ dealId, auditDetails, activity: mockActivity });

      // Assert
      expect(result).toEqual({ deal: mockDeal });
    });
  });
});
