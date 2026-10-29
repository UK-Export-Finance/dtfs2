import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { getCollection } from '@ukef/external-api/server/database';
import { EstoreRepo } from './estore-repo';

const mockUpdateOne = jest.fn();
const mockFindOne = jest.fn();

jest.mock('../../database', () => ({
  getCollection: jest.fn(async () => ({
    updateOne: (...args: unknown[]) => mockUpdateOne(...args),
    findOne: (...args: unknown[]) => mockFindOne(...args),
  })),
}));

describe('EstoreRepo', () => {
  const dealId = '507f1f77bcf86cd799439011';
  const document = { status: 'completed' };
  const result: UpdateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: new ObjectId(dealId) };

  beforeEach(() => {
    mockUpdateOne.mockReset();
    mockFindOne.mockReset();
    jest.mocked(getCollection).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByDealId', () => {
    it('should return null only when the lookup succeeds with no match', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(null);

      // Act
      await expect(EstoreRepo.findByDealId(dealId)).resolves.toBeNull();

      // Assert
      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: dealId } });
    });

    it('should return an existing job', async () => {
      // Arrange
      const job = { _id: new ObjectId(dealId), payload: { dealId } };
      mockFindOne.mockResolvedValueOnce(job);

      // Act & Assert
      await expect(EstoreRepo.findByDealId(dealId)).resolves.toEqual(job);
    });

    it('should log and propagate a rejected lookup', async () => {
      // Arrange
      const error = new Error('MongoDB read failed');
      mockFindOne.mockRejectedValueOnce(error);

      // Act
      await expect(EstoreRepo.findByDealId(dealId)).rejects.toBe(error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'An error occurred while finding deal %s in %s collection. %o',
        dealId,
        MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
        error,
      );
    });

    it('should propagate collection acquisition failures', async () => {
      // Arrange
      const error = new Error('Collection unavailable');
      jest.mocked(getCollection).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(EstoreRepo.findByDealId(dealId)).rejects.toBe(error);

      expect(mockFindOne).not.toHaveBeenCalled();
    });
  });

  describe.each([
    {
      name: 'updateByDealId',
      update: EstoreRepo.updateByDealId,
      collectionName: MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
      filter: { 'payload.dealId': { $eq: dealId } },
    },
    {
      name: 'updateTfmDealByDealId',
      update: EstoreRepo.updateTfmDealByDealId,
      collectionName: MONGO_DB_COLLECTIONS.TFM_DEALS,
      filter: { _id: { $eq: new ObjectId(dealId) } },
    },
  ])('$name', ({ update, collectionName, filter }) => {
    it('should return the database update result', async () => {
      // Arrange
      mockUpdateOne.mockResolvedValueOnce(result);

      // Act & Assert
      await expect(update(dealId, document)).resolves.toEqual(result);

      expect(getCollection).toHaveBeenCalledWith(collectionName);
      expect(mockUpdateOne).toHaveBeenCalledWith(filter, { $set: document });
    });

    it('should log and propagates the original rejected write', async () => {
      // Arrange
      const error = new Error('MongoDB write failed');
      mockUpdateOne.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(update(dealId, document)).rejects.toBe(error);

      expect(console.error).toHaveBeenCalledWith('An error occurred while updating %s collection. %o', collectionName, error);
    });

    it('should log and propagates collection acquisition failures', async () => {
      // Arrange
      const error = new Error('Collection unavailable');
      jest.mocked(getCollection).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(update(dealId, document)).rejects.toBe(error);

      expect(mockUpdateOne).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('An error occurred while updating %s collection. %o', collectionName, error);
    });
  });
});
