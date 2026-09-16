import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../drivers/db-client';
import { getAllPortalBankListEntries } from './portal-bank-list-repo';

const docs = [{ name: 'Bank 1', order: 1 }];

describe('portal-bank-list-repo', () => {
  const toArrayMock = jest.fn();
  const sortMock = jest.fn();
  const findMock = jest.fn();
  const getCollectionMock = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllPortalBankListEntries', () => {
    beforeEach(() => {
      toArrayMock.mockResolvedValue(docs);
      sortMock.mockReturnValue({ toArray: toArrayMock });
      findMock.mockReturnValue({ sort: sortMock });
      getCollectionMock.mockResolvedValue({ find: findMock });

      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('should call the mongo collection with the correct projection and sort order', async () => {
      await getAllPortalBankListEntries();

      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
      expect(findMock).toHaveBeenCalledWith({}, { projection: { name: 1, order: 1 } });
      expect(sortMock).toHaveBeenCalledWith({ order: 1, name: 1 });
      expect(toArrayMock).toHaveBeenNthCalledWith(1);
    });

    it('should return the documents returned by the mongo collection', async () => {
      const returnedDocs = await getAllPortalBankListEntries();

      expect(returnedDocs).toEqual(docs);
    });
  });
});
