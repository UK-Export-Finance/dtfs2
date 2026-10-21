import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { getCollection } from '../../database';
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
    it('returns null only when the lookup succeeds with no match', async () => {
      mockFindOne.mockResolvedValueOnce(null);

      await expect(EstoreRepo.findByDealId(dealId)).resolves.toBeNull();

      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: dealId } });
    });

    it('returns an existing job', async () => {
      const job = { _id: new ObjectId(dealId), payload: { dealId } };
      mockFindOne.mockResolvedValueOnce(job);

      await expect(EstoreRepo.findByDealId(dealId)).resolves.toEqual(job);
    });

    it('logs and propagates a rejected lookup', async () => {
      const error = new Error('MongoDB read failed');
      mockFindOne.mockRejectedValueOnce(error);

      await expect(EstoreRepo.findByDealId(dealId)).rejects.toBe(error);

      expect(console.error).toHaveBeenCalledWith(
        'An error occurred while finding deal %s in %s collection. %o',
        dealId,
        MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
        error,
      );
    });

    it('propagates collection acquisition failures', async () => {
      const error = new Error('Collection unavailable');
      jest.mocked(getCollection).mockRejectedValueOnce(error);

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
    it('returns the database update result', async () => {
      mockUpdateOne.mockResolvedValueOnce(result);

      await expect(update(dealId, document)).resolves.toEqual(result);

      expect(getCollection).toHaveBeenCalledWith(collectionName);
      expect(mockUpdateOne).toHaveBeenCalledWith(filter, { $set: document });
    });

    it('logs and propagates the original rejected write', async () => {
      const error = new Error('MongoDB write failed');
      mockUpdateOne.mockRejectedValueOnce(error);

      await expect(update(dealId, document)).rejects.toBe(error);

      expect(console.error).toHaveBeenCalledWith('An error occurred while updating %s collection. %o', collectionName, error);
    });

    it('logs and propagates collection acquisition failures', async () => {
      const error = new Error('Collection unavailable');
      jest.mocked(getCollection).mockRejectedValueOnce(error);

      await expect(update(dealId, document)).rejects.toBe(error);

      expect(mockUpdateOne).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('An error occurred while updating %s collection. %o', collectionName, error);
    });
  });
});
