import { HttpStatusCode } from 'axios';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { mongoDbClient } from '../../../server/drivers/db-client';

const BASE_URL = '/v1/bank/portal-bank-list';

type PortalBankListSeedEntry = {
  _id: ObjectId;
  name: string;
  order: number;
};

const aPortalBankListSeedEntry = (overrides: Partial<PortalBankListSeedEntry> = {}): PortalBankListSeedEntry => ({
  _id: new ObjectId(),
  name: 'Bank 1',
  order: 1,
  ...overrides,
});

describe(`GET ${BASE_URL}`, () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST]);
  });

  afterAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST]);
  });

  describe('when the portal-bank-list collection is empty', () => {
    it(`should respond with a ${HttpStatusCode.Ok} and an empty array`, async () => {
      const response = await testApi.get(BASE_URL);

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.body).toEqual([]);
    });
  });

  describe('when the portal-bank-list collection has entries', () => {
    const entries: PortalBankListSeedEntry[] = [
      aPortalBankListSeedEntry({ name: 'Charlie Bank', order: 2 }),
      aPortalBankListSeedEntry({ name: 'Alpha Bank', order: 1 }),
      aPortalBankListSeedEntry({ name: 'Bravo Bank', order: 3 }),
    ];

    beforeEach(async () => {
      const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
      await collection.insertMany(entries);
    });

    it(`should respond with a ${HttpStatusCode.Ok}`, async () => {
      const response = await testApi.get(BASE_URL);

      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    it('should return all entries from the collection in order field order', async () => {
      const response = await testApi.get(BASE_URL);

      const expected = [entries[1], entries[0], entries[2]].map(({ _id, name, order }) => ({ _id: _id.toString(), name, order }));

      expect(response.body).toEqual(expected);
    });
  });
});
