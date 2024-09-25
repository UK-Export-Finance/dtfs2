import { DealNotFoundError, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
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

    it('returns an error if no matching result is found', async () => {
      // Arrange
      findOneMock.mockResolvedValue(undefined);

      getCollectionMock.mockResolvedValue({ findOne: findOneMock });

      // Assert
      await expect(TfmDealCancellationRepo.findDealCancellationByDealId(dealId)).rejects.toThrow(new DealNotFoundError(dealId.toString()));
    });

    it('returns an empty object if a deal is found without a cancellation', async () => {
      // Arrange
      findOneMock.mockResolvedValue({ tfm: {} });

      getCollectionMock.mockResolvedValue({ findOne: findOneMock });

      // Act
      const result = await TfmDealCancellationRepo.findDealCancellationByDealId(dealId);

      // Assert
      expect(result).toEqual({});
    });

    it('returns the found deal cancellation', async () => {
      // Act
      const result = await TfmDealCancellationRepo.findDealCancellationByDealId(dealId);

      // Assert
      expect(result).toEqual(mockDealCancellationObject);
    });
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
      await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalled();
    });

    it('returns an error if no matching result is found', async () => {
      // Arrange
      const mockFailedUpdateResult = { matchedCount: 0 };

      updateOneMock.mockResolvedValue(mockFailedUpdateResult);

      getCollectionMock.mockResolvedValue({ updateOne: updateOneMock });

      // Assert
      await expect(TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject)).rejects.toThrow(
        new DealNotFoundError(dealId.toString()),
      );
    });

    it('calls updateOne with the expected parameters', async () => {
      // Act
      await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledWith(expect.objectContaining({ _id: { $eq: new ObjectId(dealId) } }), mockDealCancellationObject);
    });

    it('returns the deal cancellation update', async () => {
      // Act
      const result = await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject);

      // Assert
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
