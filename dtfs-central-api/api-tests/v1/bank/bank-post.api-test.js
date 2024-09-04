import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { MOCK_BANKS } from '../../mocks/banks';
import { withoutMongoId } from '../../../src/helpers/mongodb';
import { testApi } from '../../test-api';

describe('/v1/bank', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('POST /v1/bank', () => {
    it('creates a bank', async () => {
      const newBank = withoutMongoId(MOCK_BANKS.HSBC);

      const { body, status } = await testApi.post(newBank).to('/v1/bank');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: bankAfterCreation } = await testApi.get(`/v1/bank/${newBank.id}`);

      expect(bankAfterCreation).toEqual({
        _id: body._id,
        ...newBank,
      });
    });
  });
});
