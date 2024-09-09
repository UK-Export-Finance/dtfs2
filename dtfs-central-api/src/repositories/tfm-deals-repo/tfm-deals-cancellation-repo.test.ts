import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';

const dealId = new ObjectId();

const mockDealCancellationObject = { reason: 'test reason', bankRequestDate: getUnixTime(new Date()), effectiveFrom: getUnixTime(new Date()) };
const mockDealObject = { tfm: { cancellation: mockDealCancellationObject } };

describe('tfm-deals-cancellation-repo', () => {
  const findOneMock = jest.fn();
  const updateOneMock = jest.fn();
  const getCollectionMock = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findDealCancellationByDealId', () => {
    beforeEach(() => {
      findOneMock.mockResolvedValue(mockDealObject);
      getCollectionMock.mockResolvedValue({});

      getCollectionMock.mockResolvedValue({
        findOne: findOneMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('calls the DB with the correct collection name', async () => {
      // Act
      await TfmDealCancellationRepo.findDealCancellationByDealId(dealId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(findOneMock).toHaveBeenCalled();
    });

    it('returns the found deal cancellation', async () => {
      // Act
      const result = await TfmDealCancellationRepo.findDealCancellationByDealId(dealId);

      // Assert
      expect(result).toEqual(mockDealCancellationObject);
    });
  });

  describe('updateOneDealWithCancellation', () => {
    beforeEach(() => {
      findOneMock.mockResolvedValue(mockDealObject);
      updateOneMock.mockResolvedValue({});
      getCollectionMock.mockResolvedValue({});

      getCollectionMock.mockResolvedValue({
        findOne: findOneMock,
        updateOne: updateOneMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('calls the DB with the correct collection name', async () => {
      // Act
      await TfmDealCancellationRepo.updateOneDealWithCancellation(dealId, mockDealCancellationObject);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(findOneMock).toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalled();
    });

    it('calls updateOne with the expected parameters', async () => {
      // Act
      await TfmDealCancellationRepo.updateOneDealWithCancellation(dealId, mockDealCancellationObject);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(findOneMock).toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalledWith({ _id: { $eq: dealId } }, mockDealCancellationObject);
    });
  });
});
