const wipeDB = require('../../../wipeDB');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');

const { as } = require('../../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../../expectMongoIds');

const allMandatoryCriteria = require('../../../fixtures/gef/mandatoryCriteriaVersioned');
const newMandatoryCriteria = allMandatoryCriteria[0];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  title: 'Updated mandatory criteria versioned',
}

describe('/v1/gef/mandatory-criteria-versioned', () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['mandatoryCriteriaVersioned']);
  });

  describe('GET /v1/gef/mandatory-criteria-versioned', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/gef/mandatory-criteria-versioned');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/gef/mandatory-criteria-versioned');

      expect(status).toEqual(200);
    });

    it('returns a list of mandatory-criteria-versioned sorted by version', async () => {
      await as(anEditor).post(allMandatoryCriteria[0]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[1]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[2]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[3]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[4]).to('/v1/gef/mandatory-criteria-versioned');

      const { body } = await as(noRoles).get('/v1/gef/mandatory-criteria-versioned');

      expect(body).toEqual({
        count: 5,
        mandatoryCriteria: expect.arrayContaining([
          expect.objectContaining(allMandatoryCriteria[0]),
          expect.objectContaining(allMandatoryCriteria[1]),
          expect.objectContaining(allMandatoryCriteria[2]),
          expect.objectContaining(allMandatoryCriteria[3]),
          expect.objectContaining(allMandatoryCriteria[4])
        ])
      });
    });

  });

  describe('GET /v1/gef/mandatory-criteria-versioned/latest', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/gef/mandatory-criteria-versioned/latest');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/gef/mandatory-criteria-versioned/latest');

      expect(status).toEqual(200);
    });

    it('returns the latest mandatory-criteria version', async () => {

      await as(anEditor).post(allMandatoryCriteria[0]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[1]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[2]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[3]).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).post(allMandatoryCriteria[4]).to('/v1/gef/mandatory-criteria-versioned');

      const { body } = await as(noRoles).get(`/v1/gef/mandatory-criteria-versioned/latest`);

      expect(body).toEqual(expect.objectContaining(allMandatoryCriteria[2]));
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria-versioned', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      const { status, body } = await as(anEditor).get('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newMandatoryCriteria));
    });
  });

  describe('POST /v1/gef/mandatory-criteria-versioned', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      const { status } = await as(noRoles).put(updatedMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      const { status } = await as(anEditor).put(updatedMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(200);
    });

    describe('updating the mandatory-criteria-versioned', () => {
      it('works for title field', async () => {
        const mandatoryCriteria = allMandatoryCriteria[1];
        const titleUpdate = {
          title: 'Confirm eligiblity (mandatory criteria)',
        };

        await as(anEditor).post(mandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');
        await as(anEditor).put(titleUpdate).to(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

        const { status, body } = await as(anEditor).get(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

        expect(status).toEqual(200);
        expect(body).toEqual(expectMongoId({
          ...mandatoryCriteria,
          ...titleUpdate,
        }));
      });

      it('works for items', async () => {
        const mandatoryCriteria = allMandatoryCriteria[2];
        const itemUpdate = {
          version: 99,
          dateCreated: "2021-01-01T00:00",
          isInDraft: true,
          title: 'test 99',
          htmlText: `<p>Test is a mock test</p>`
        };

        await as(anEditor).post(mandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');
        await as(anEditor).put(itemUpdate).to(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

        const { status, body } = await as(anEditor).get(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

        expect(status).toEqual(200);
        expect(body).toEqual(expectMongoId({
          ...mandatoryCriteria,
          ...itemUpdate,
        }));
      });

    })
  });

  describe('DELETE /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      const { status } = await as(noRoles).remove('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

      const { status } = await as(anEditor).remove('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');
      await as(anEditor).remove('/v1/gef/mandatory-criteria-versioned/1');

      const { status, body } = await as(anEditor).get('/v1/gef/mandatory-criteria-versioned/1');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
