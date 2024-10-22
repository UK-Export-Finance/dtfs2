import { DEAL_SUBMISSION_TYPE, MONGO_DB_COLLECTIONS, TFM_DEAL_CANCELLATION_STATUS, TFM_DEAL_STAGE } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';

describe('tfm-deals-cancellation-repo', () => {
  const findToArrayMock = jest.fn();
  const findMock = jest.fn();
  const getCollectionMock = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findScheduledDealCancellations', () => {
    const mockDeals = [{ _id: new ObjectId() }];

    beforeEach(() => {
      findToArrayMock.mockResolvedValue(mockDeals);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      getCollectionMock.mockResolvedValue({
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('calls the DB with the correct collection name', async () => {
      // Act
      await TfmDealCancellationRepo.findScheduledDealCancellations();

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
    });

    it('calls find with the expected filter', async () => {
      // Act
      await TfmDealCancellationRepo.findScheduledDealCancellations();

      // Assert
      const expectedFilter = {
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'tfm.cancellation.status': { $eq: TFM_DEAL_CANCELLATION_STATUS.SCHEDULED },
      };

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(expectedFilter);
    });

    it('returns found deals', async () => {
      // Act
      const result = await TfmDealCancellationRepo.findScheduledDealCancellations();

      // Assert
      expect(result).toEqual(mockDeals);
    });
  });
});
