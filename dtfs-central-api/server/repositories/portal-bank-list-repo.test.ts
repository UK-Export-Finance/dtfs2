import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../drivers/db-client';
import { getAllPortalBankListEntries } from './portal-bank-list-repo';

describe('portal-bank-list-repo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllPortalBankListEntries', () => {
    it('should call the mongo collection with the correct projection and sort order', async () => {
      const toArrayMock = jest.fn();
      const sortMock = jest.fn(() => ({ toArray: toArrayMock }));
      const findMock = jest.fn(() => ({ sort: sortMock }));
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findMock,
      });

      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      await getAllPortalBankListEntries();

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
      expect(findMock).toHaveBeenCalledWith({}, { projection: { name: 1, order: 1 } });
      expect(sortMock).toHaveBeenCalledWith({ order: 1 });
      expect(toArrayMock).toHaveBeenCalled();
    });
  });
});
