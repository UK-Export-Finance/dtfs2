const wipeDB = require('../../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

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

describe('/v1/industry-sectors', () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['industrySectors']);
  });

  describe('GET /v1/industry-sectors', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/industry-sectors');

      expect(status).toEqual(200);
    });

    it('returns a list of industry-sectors', async () => {
      await as(anEditor).postEach([aaaa, pppp, mmmm]).to('/v1/industry-sectors');

      const { status, body } = await as(noRoles).get('/v1/industry-sectors');

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
      const { status } = await as().get('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/industry-sectors/101');

      expect(status).toEqual(200);
    });

    it('returns an industry-sector', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');

      const { status, body } = await as(noRoles).get('/v1/industry-sectors/101');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newIndustrySector));
    });
  });

  describe('POST /v1/industry-sectors', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newIndustrySector).to('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newIndustrySector).to('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedIndustrySector).to('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');

      const { status } = await as(noRoles).put(updatedIndustrySector).to('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');

      const { status } = await as(anEditor).put(updatedIndustrySector).to('/v1/industry-sectors/101');

      expect(status).toEqual(200);
    });

    it('updates the industry-sector', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');
      await as(anEditor).put(updatedIndustrySector).to('/v1/industry-sectors/101');

      const { status, body } = await as(anEditor).get('/v1/industry-sectors/101');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedIndustrySector));
    });
  });

  describe('DELETE /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');
      const { status } = await as(noRoles).remove('/v1/industry-sectors/101');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');
      const { status } = await as(anEditor).remove('/v1/industry-sectors/101');

      expect(status).toEqual(200);
    });

    it('deletes the industry-sector', async () => {
      await as(anEditor).post(newIndustrySector).to('/v1/industry-sectors');
      await as(anEditor).remove('/v1/industry-sectors/101');

      const { status, body } = await as(anEditor).get('/v1/industry-sectors/101');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
