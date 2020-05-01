const wipeDB = require('../../wipeDB');
const aMandatoryCriteria = require('./mandatory-criteria-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });
const updatedMandatoryCriteria = aMandatoryCriteria({
  id: '2',
  title: 'Updated mandatory criteria',
});

describe('/v1/mandatory-criteria', () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['mandatoryCriteria']);
  });

  describe('GET /v1/mandatory-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/mandatory-criteria');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/mandatory-criteria');

      expect(status).toEqual(200);
    });

    it('returns a list of mandatory-criteria sorted by id', async () => {
      const criteria = [
        aMandatoryCriteria({ id: '4' }),
        aMandatoryCriteria({ id: '1' }),
        aMandatoryCriteria({ id: '2' }),
      ];

      await as(anEditor).postEach(criteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(noRoles).get('/v1/mandatory-criteria');

      const expectedSortedMandatoryCriteria = [
        criteria[1],
        criteria[2],
        criteria[0],
      ];

      expect(status).toEqual(200);
      expect(body.mandatoryCriteria).toEqual(expectMongoIds(expectedSortedMandatoryCriteria));
    });
  });

  describe('GET /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newMandatoryCriteria));
    });
  });

  describe('POST /v1/mandatory-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(noRoles).put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(anEditor).put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
    });

    it('updates the mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anEditor).put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/2');

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedMandatoryCriteria));
    });
  });

  describe('DELETE /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(noRoles).remove('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(anEditor).remove('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anEditor).remove('/v1/mandatory-criteria/2');

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
