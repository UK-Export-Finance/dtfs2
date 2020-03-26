const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);
const { expectMongoId, expectMongoIds} = require('../expectMongoIds');

const getToken = require('../getToken')(app);

describe('/api/deals', () => {
  const newDeal = aDeal({ _id: '1996', supplyContractName: 'Original Value' });
  const updatedDeal = aDeal({
    _id: '1996',
    supplyContractName: 'Updated Value',
  });

  let aTokenWithNoRoles;
  let aTokenWithMakerRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles    = await getToken({username:'1',password:'2',roles:[]});
    aTokenWithMakerRole = await getToken({username:'3',password:'4',roles:['maker']});
  });

  describe('GET /api/deals', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/deals');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const {status} = await get('/api/deals', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of deals', async () => {
      const deals = [aDeal({ _id: '1' }), aDeal({ _id: '2' }), aDeal({ _id: '3' })];

      await post(deals[0], aTokenWithMakerRole).to('/api/deals');
      await post(deals[1], aTokenWithMakerRole).to('/api/deals');
      await post(deals[2], aTokenWithMakerRole).to('/api/deals');

      const {status, body} = await get('/api/deals', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectMongoIds(deals));
    });
  });

  describe('GET /api/deals/:_id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/deals/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const {status} = await get('/api/deals/123', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a deal', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');

      const {status, body} = await get('/api/deals/1996', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newDeal));
    });

  });

  describe('POST /api/deals', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await post(newDeal).to('/api/deals');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "maker" role', async () => {
      const {status} = await post(newDeal, aTokenWithNoRoles).to('/api/deals');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const {status} = await post(newDeal, aTokenWithMakerRole).to('/api/deals');

      expect(status).toEqual(200);
    });

    it('returns the deal object', async () => {
      const {body} = await post(newDeal, aTokenWithMakerRole).to('/api/deals');

      expect(body).toEqual(expectMongoId(newDeal));
    });

  });

  describe('PUT /api/deals/:_id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedDeal).to('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "maker" role', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      const {status} = await put(updatedDeal, aTokenWithNoRoles).to('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      const {status} = await put(updatedDeal, aTokenWithMakerRole).to('/api/deals/1996');

      expect(status).toEqual(200);
    });

    it('updates the deal', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      await put(updatedDeal, aTokenWithMakerRole).to('/api/deals/1996');

      const {status, body} = await get('/api/deals/1996', aTokenWithMakerRole);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedDeal));
    });

    it('returns the updated deal', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      const {status, body} = await put(updatedDeal, aTokenWithMakerRole).to('/api/deals/1996');

      expect(body).toEqual(expectMongoId(updatedDeal));
    });
  });

  describe('DELETE /api/deals/:_id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await remove('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "maker" role', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      const {status} = await remove('/api/deals/1996', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      const {status} = await remove('/api/deals/1996', aTokenWithMakerRole);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      await post(newDeal, aTokenWithMakerRole).to('/api/deals');
      await remove('/api/deals/1996', aTokenWithMakerRole);

      const {status, body} = await get('/api/deals/1996', aTokenWithMakerRole);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
