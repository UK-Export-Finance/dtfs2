import { DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { mongoDbClient as db } from '../../drivers/db-client';
import { TfmDealCancellationRepo } from './tfm-deal-cancellation.repo';
import { aTfmUser } from '../../../test-helpers';

const dealId = new ObjectId();

const mockDealCancellationObject = { reason: 'test reason', bankRequestDate: getUnixTime(new Date()), effectiveFrom: getUnixTime(new Date()) };
const mockDealObject = { tfm: { cancellation: mockDealCancellationObject } };

const tfmUserId = aTfmUser()._id;

const auditDetails = generateTfmAuditDetails(tfmUserId);

describe('tfm-deals-cancellation-repo', () => {
  const findOneMock = jest.fn();
  const updateOneMock = jest.fn();
  const getCollectionMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1727876437063);
  });

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
      const expectedUpdate = flatten({
        'tfm.cancellation': mockDealCancellationObject,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      });

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_DEALS);
      expect(updateOneMock).toHaveBeenCalledWith(expect.objectContaining({ _id: { $eq: new ObjectId(dealId) } }), expectedUpdate);
    });

    it('returns the deal cancellation update', async () => {
      // Act
      const result = await TfmDealCancellationRepo.updateOneDealCancellation(dealId, mockDealCancellationObject, auditDetails);

      // Assert
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
