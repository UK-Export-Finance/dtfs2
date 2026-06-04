import { HttpStatusCode } from 'axios';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { mongoDbClient } from '../../../server/drivers/db-client';

const BASE_URL = '/v1/portal-bank-list';

type PortalBankListSeedEntry = {
  _id: ObjectId;
  name: string;
  order: number;
};

const aPortalBankListSeedEntry = (overrides: Partial<PortalBankListSeedEntry> = {}): PortalBankListSeedEntry => ({
  _id: new ObjectId(),
  name: 'Barclays Bank',
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
    it('should respond with a 200 (Ok) and an empty array', async () => {
      const response = await testApi.get(BASE_URL);

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.body).toEqual([]);
    });
  });

  describe('when the portal-bank-list collection has entries', () => {
    const entries: PortalBankListSeedEntry[] = [
      aPortalBankListSeedEntry({ name: 'HSBC UK Bank', order: 2 }),
      aPortalBankListSeedEntry({ name: 'Barclays Bank', order: 1 }),
      aPortalBankListSeedEntry({ name: 'Lloyds Bank', order: 3 }),
    ];

    beforeEach(async () => {
      const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
      await collection.insertMany(entries);
    });

    it('should respond with a 200 (Ok)', async () => {
      const response = await testApi.get(BASE_URL);

      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    it('should return all entries from the collection sorted by order ascending', async () => {
      const response = await testApi.get(BASE_URL);

      const expected = [
        { _id: entries[1]._id.toString(), name: 'Barclays Bank', order: 1 },
        { _id: entries[0]._id.toString(), name: 'HSBC UK Bank', order: 2 },
        { _id: entries[2]._id.toString(), name: 'Lloyds Bank', order: 3 },
      ];

      expect(response.body).toEqual(expected);
    });
  });
});
