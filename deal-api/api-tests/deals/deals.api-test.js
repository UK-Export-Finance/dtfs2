const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);
const { expectMongoId, expectMongoIds} = require('../expectMongoIds');

const getToken = require('../getToken')(app);

describe('/api/deals', () => {
  const newDeal = aDeal({ id: '1996', supplyContractName: 'Original Value' });
  const updatedDeal = aDeal({
    id: '1996',
    supplyContractName: 'Updated Value',
  });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles    = await getToken({username:'1',password:'2',roles:[]});
    aTokenWithEditorRole = await getToken({username:'3',password:'4',roles:['editor']});
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
      const deals = [aDeal({ id: '1' }), aDeal({ id: '2' }), aDeal({ id: '3' })];

      await post(deals[0], aTokenWithEditorRole).to('/api/deals');
      await post(deals[1], aTokenWithEditorRole).to('/api/deals');
      await post(deals[2], aTokenWithEditorRole).to('/api/deals');

      const {status, body} = await get('/api/deals', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body.deals).toEqual(expectMongoIds(deals));
    });
  });

  describe('GET /api/deals/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/deals/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const {status} = await get('/api/deals/123', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a deal', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');

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

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const {status} = await post(newDeal, aTokenWithNoRoles).to('/api/deals');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const {status} = await post(newDeal, aTokenWithEditorRole).to('/api/deals');

      expect(status).toEqual(200);
    });

  });

  describe('PUT /api/deals/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedDeal).to('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      const {status} = await put(updatedDeal, aTokenWithNoRoles).to('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      const {status} = await put(updatedDeal, aTokenWithEditorRole).to('/api/deals/1996');

      expect(status).toEqual(200);
    });

    it('updates the deal', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      await put(updatedDeal, aTokenWithEditorRole).to('/api/deals/1996');

      const {status, body} = await get('/api/deals/1996', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedDeal));
    });
  });

  describe('DELETE /api/deals/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await remove('/api/deals/1996');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      const {status} = await remove('/api/deals/1996', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      const {status} = await remove('/api/deals/1996', aTokenWithEditorRole);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      await post(newDeal, aTokenWithEditorRole).to('/api/deals');
      await remove('/api/deals/1996', aTokenWithEditorRole);

      const {status, body} = await get('/api/deals/1996', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
