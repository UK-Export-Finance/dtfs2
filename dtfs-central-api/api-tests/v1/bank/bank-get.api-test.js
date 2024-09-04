import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { MOCK_BANKS } from '../../mocks/banks';
import { withoutMongoId } from '../../../src/helpers/mongodb';
import { testApi } from '../../test-api';

describe('/v1/bank/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
  });

  describe('GET /v1/bank/:id', () => {
    it('returns a bank', async () => {
      const newBank = withoutMongoId(MOCK_BANKS.HSBC);

      const { body: createdBank } = await testApi.post(newBank).to('/v1/bank');

      const { body, status } = await testApi.get(`/v1/bank/${newBank.id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdBank._id,
        ...newBank,
      };

      expect(body).toEqual(expected);
    });
  });
});
