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

  beforeEach(async () => {
    await wipeDB();
  });

  describe('GET /api/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const token = await getToken({username:'1',password:'2',roles:[]});

      const {status} = await get('/api/banks', token);

      expect(status).toEqual(200);
    });

    it('returns a list of banks', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      const banks = [aBank({ id: '1' }), aBank({ id: '2' }), aBank({ id: '3' })];

      await post(banks[0], token).to('/api/banks');
      await post(banks[1], token).to('/api/banks');
      await post(banks[2], token).to('/api/banks');

      const {status, body} = await get('/api/banks', token);

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
      const token = await getToken({username:'1',password:'2',roles:[]});

      const {status} = await get('/api/banks/123', token);

      expect(status).toEqual(200);
    });

    it('returns a bank', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      await post(newBank, token).to('/api/banks');

      const {status, body} = await get('/api/banks/112233', token);

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
      const token = await getToken({username:'1',password:'2',roles:['']});

      const {status} = await post(newBank, token).to('/api/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      const {status} = await post(newBank, token).to('/api/banks');

      expect(status).toEqual(200);
    });

  });

  describe('PUT /api/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedBank).to('/api/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const editorToken = await getToken({username:'1',password:'2',roles:['editor']});
      const nonEditorToken = await getToken({username:'12',password:'23',roles:['']});

      await post(newBank, editorToken).to('/api/banks');
      const {status} = await put(updatedBank, nonEditorToken).to('/api/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      await post(newBank, token).to('/api/banks');
      const {status} = await put(updatedBank, token).to('/api/banks/112233');

      expect(status).toEqual(200);
    });

    it('updates the bank', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      await post(newBank, token).to('/api/banks');
      await put(updatedBank, token).to('/api/banks/112233');

      const {status, body} = await get('/api/banks/112233', token);

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
      const editorToken = await getToken({username:'1',password:'2',roles:['editor']});
      const nonEditorToken = await getToken({username:'12',password:'23',roles:['']});

      await post(newBank, editorToken).to('/api/banks');
      const {status} = await remove('/api/banks/112233', nonEditorToken);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      await post(newBank, token).to('/api/banks');
      const {status} = await remove('/api/banks/112233', token);

      expect(status).toEqual(200);
    });

    it('deletes the bank', async () => {
      const token = await getToken({username:'1',password:'2',roles:['editor']});

      await post(newBank, token).to('/api/banks');
      await remove('/api/banks/112233', token);

      const {status, body} = await get('/api/banks/112233', token);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
