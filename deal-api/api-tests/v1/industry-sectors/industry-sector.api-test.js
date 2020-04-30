const wipeDB = require('../../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

describe('/v1/industry-sectors', () => {
  let noRoles;
  let anEditor;

  const mockClasses = [
    { code: 'b', name: 'b' },
    { code: 'c', name: 'c' },
    { code: 'a', name: 'a' },
  ];

  const aaaa = anIndustrySector({ code: '100', name: 'AAAA', classes: mockClasses });
  const pppp = anIndustrySector({ code: '200', name: 'PPPP', classes: mockClasses });
  const mmmm = anIndustrySector({ code: '300', name: 'MMMM', classes: mockClasses });

  const newIndustrySector = anIndustrySector({ code: '101', name: 'AAAB', classes: mockClasses });
  const updatedIndustrySector = anIndustrySector({ code: '101', name: 'BBBA', classes: mockClasses });

  beforeEach(async () => {
    await wipeDB.wipe(['industrySectors']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  describe('GET /v1/industry-sectors', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/industry-sectors', noRoles.token);

      expect(status).toEqual(200);
    });

    it('returns a list of industry-sectors', async () => {
      await post(aaaa, anEditor.token).to('/v1/industry-sectors');
      await post(pppp, anEditor.token).to('/v1/industry-sectors');
      await post(mmmm, anEditor.token).to('/v1/industry-sectors');

      const { status, body } = await get('/v1/industry-sectors', noRoles.token);

      const expectedClasses = [
        { code: 'a', name: 'a' },
        { code: 'b', name: 'b' },
        { code: 'c', name: 'c' },
      ];

      const expectedResult = [
        { ...aaaa, classes: expectedClasses },
        { ...mmmm, classes: expectedClasses },
        { ...pppp, classes: expectedClasses },
      ];

      expect(status).toEqual(200);
      expect(body.industrySectors).toEqual(expectMongoIds(expectedResult));
    });
  });

  describe('GET /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await get('/v1/industry-sectors/101', noRoles.token);

      expect(status).toEqual(200);
    });

    it('returns an industry-sector', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');

      const { status, body } = await get('/v1/industry-sectors/101', noRoles.token);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newIndustrySector));
    });
  });

  describe('POST /v1/industry-sectors', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newIndustrySector).to('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await post(newIndustrySector, noRoles.token).to('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedIndustrySector).to('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      const { status } = await put(updatedIndustrySector, noRoles.token).to('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      const { status } = await put(updatedIndustrySector, anEditor.token).to('/v1/industry-sectors/101');

      expect(status).toEqual(200);
    });

    it('updates the industry-sector', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      await put(updatedIndustrySector, anEditor.token).to('/v1/industry-sectors/101');

      const { status, body } = await get('/v1/industry-sectors/101', anEditor.token);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedIndustrySector));
    });
  });

  describe('DELETE /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      const { status } = await remove('/v1/industry-sectors/101', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      const { status } = await remove('/v1/industry-sectors/101', anEditor.token);

      expect(status).toEqual(200);
    });

    it('deletes the industry-sector', async () => {
      await post(newIndustrySector, anEditor.token).to('/v1/industry-sectors');
      await remove('/v1/industry-sectors/101', anEditor.token);

      const { status, body } = await get('/v1/industry-sectors/101', anEditor.token);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
