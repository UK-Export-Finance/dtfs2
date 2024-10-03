import { DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';

const dealId = new ObjectId();

const mockDealCancellationObject = { reason: 'test reason', bankRequestDate: getUnixTime(new Date()), effectiveFrom: getUnixTime(new Date()) };
const mockDealObject = { tfm: { cancellation: mockDealCancellationObject } };

describe('tfm-deals-cancellation-repo', () => {
  const findOneMock = jest.fn();
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

    it('throws an InvalidDealIdError if deal id is not a valid object id', async () => {
      // Arrange
      const invalidDealId = 'xyz';

      // Assert
      await expect(TfmDealCancellationRepo.findDealCancellationByDealId(invalidDealId)).rejects.toThrow(new InvalidDealIdError(invalidDealId.toString()));
    });

    it('throws a DealNotFoundError if no matching result is found', async () => {
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
});
