const wipeDB = require('../wipeDB');
const aBank = require('./bank-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);
const { expectMongoId, expectMongoIds} = require('../expectMongoIds');

const getToken = require('../getToken')(app);

describe('/api/banks', () => {
  const newBank = aBank({ id: '112233' });
  const updatedBank = aBank({
    id: '112233',
    bankName: 'Updated bank name',
  });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles    = await getToken({username:'1',password:'2',roles:[]});
    aTokenWithEditorRole = await getToken({username:'3',password:'4',roles:['editor']});
  });

  describe('GET /api/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const {status} = await get('/api/banks', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of banks', async () => {
      const banks = [aBank({ id: '1' }), aBank({ id: '2' }), aBank({ id: '3' })];

      await post(banks[0], aTokenWithEditorRole).to('/api/banks');
      await post(banks[1], aTokenWithEditorRole).to('/api/banks');
      await post(banks[2], aTokenWithEditorRole).to('/api/banks');

      const {status, body} = await get('/api/banks', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body.banks).toEqual(expectMongoIds(banks));
    });
  });

  describe('GET /api/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/banks/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const {status} = await get('/api/banks/123', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a bank', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');

      const {status, body} = await get('/api/banks/112233', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newBank));
    });

  });

  describe('POST /api/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await post(newBank).to('/api/banks');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const {status} = await post(newBank, aTokenWithNoRoles).to('/api/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const {status} = await post(newBank, aTokenWithEditorRole).to('/api/banks');

      expect(status).toEqual(200);
    });

  });

  describe('PUT /api/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedBank).to('/api/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      const {status} = await put(updatedBank, aTokenWithNoRoles).to('/api/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      const {status} = await put(updatedBank, aTokenWithEditorRole).to('/api/banks/112233');

      expect(status).toEqual(200);
    });

    it('updates the bank', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      await put(updatedBank, aTokenWithEditorRole).to('/api/banks/112233');

      const {status, body} = await get('/api/banks/112233', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedBank));
    });
  });

  describe('DELETE /api/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await remove('/api/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      const {status} = await remove('/api/banks/112233', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      const {status} = await remove('/api/banks/112233', aTokenWithEditorRole);

      expect(status).toEqual(200);
    });

    it('deletes the bank', async () => {
      await post(newBank, aTokenWithEditorRole).to('/api/banks');
      await remove('/api/banks/112233', aTokenWithEditorRole);

      const {status, body} = await get('/api/banks/112233', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
