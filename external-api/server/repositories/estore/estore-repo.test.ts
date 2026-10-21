import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { getCollection } from '../../database';
import { EstoreRepo } from './estore-repo';

const mockUpdateOne = jest.fn();

jest.mock('../../database', () => ({
  getCollection: jest.fn(async () => ({
    updateOne: (...args: unknown[]) => mockUpdateOne(...args),
  })),
}));

describe('EstoreRepo updates', () => {
  const dealId = '507f1f77bcf86cd799439011';
  const document = { status: 'completed' };
  const result: UpdateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: new ObjectId(dealId) };

  beforeEach(() => {
    mockUpdateOne.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
  });
});
