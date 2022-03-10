const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/mandatoryCriteria');
const newMandatoryCriteria = allMandatoryCriteria[0];
const oldMandatoryCriteria = allMandatoryCriteria[1];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  criteria: [
    ...newMandatoryCriteria.criteria,
    {
      title: 'Updated mandatory criteria',
    },
  ],
};

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
      await as(anEditor).post(allMandatoryCriteria[0]).to('/v1/mandatory-criteria');
      await as(anEditor).post(allMandatoryCriteria[1]).to('/v1/mandatory-criteria');

      const { body } = await as(noRoles).get(`/v1/mandatory-criteria`);

      expect(body).toEqual({
        count: allMandatoryCriteria.length,
        mandatoryCriteria: expectMongoIds(allMandatoryCriteria),
      });
    });
  });

  describe('GET /v1/mandatory-criteria/latest', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/mandatory-criteria/latest');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/mandatory-criteria/latest');

      expect(status).toEqual(200);
    });

    it('returns the latest mandatory criteria', async () => {
      await as(anEditor).post(oldMandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/latest');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newMandatoryCriteria));
    });
  });

  describe('GET /v1/mandatory-criteria/:version', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/mandatory-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/mandatory-criteria/1');

      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status, body } = await as(anEditor).get(`/v1/mandatory-criteria/${newMandatoryCriteria.version}`);

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

  describe('PUT /v1/mandatory-criteria/:version', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(noRoles).put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(anEditor).put(updatedMandatoryCriteria).to('/v1/mandatory-criteria/1');

      expect(status).toEqual(200);
    });

    it('updates a mandatory criteria', async () => {
      const mandatoryCriteria = allMandatoryCriteria[0];
      const update = {
        criteria: [
          { title: 'new title' },
        ],
      };

      await as(anEditor).post(mandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anEditor).put(update).to(`/v1/mandatory-criteria/${mandatoryCriteria.version}`);

      const { status, body } = await as(anEditor).get(`/v1/mandatory-criteria/${mandatoryCriteria.version}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId({
        ...mandatoryCriteria,
        criteria: update.criteria,
      }));
    });
  });

  describe('DELETE /v1/mandatory-criteria/:version', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/mandatory-criteria/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(noRoles).remove('/v1/mandatory-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');

      const { status } = await as(anEditor).remove('/v1/mandatory-criteria/1');

      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/mandatory-criteria');
      await as(anEditor).remove('/v1/mandatory-criteria/1');

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/1');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
