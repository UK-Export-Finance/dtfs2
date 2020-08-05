const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/mandatoryCriteria');
const newMandatoryCriteria = allMandatoryCriteria[0];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  title: 'Updated mandatory criteria',
}

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
      await as(anEditor).post(allMandatoryCriteria[2]).to('/v1/mandatory-criteria');
      await as(anEditor).post(allMandatoryCriteria[3]).to('/v1/mandatory-criteria');
      await as(anEditor).post(allMandatoryCriteria[4]).to('/v1/mandatory-criteria');

      const { body } = await as(noRoles).get(`/v1/mandatory-criteria`);

      expect(body).toEqual({
        count: 5,
        mandatoryCriteria: expectMongoIds(allMandatoryCriteria),
      });
    });
  });

  describe('GET /v1/mandatory-criteria/:id', () => {
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

      const { status, body } = await as(anEditor).get('/v1/mandatory-criteria/1');

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

    describe('updating the mandatory-criteria', () => {
      it('works for title field', async () => {
        const mandatoryCriteria = allMandatoryCriteria[1];
        const titleUpdate = {
          title: 'new title',
        };

        await as(anEditor).post(mandatoryCriteria).to('/v1/mandatory-criteria');
        await as(anEditor).put(titleUpdate).to(`/v1/mandatory-criteria/${mandatoryCriteria.id}`);

        const { status, body } = await as(anEditor).get(`/v1/mandatory-criteria/${mandatoryCriteria.id}`);

        expect(status).toEqual(200);
        expect(body).toEqual(expectMongoId({
          ...mandatoryCriteria,
          ...titleUpdate,
        }));
      });

      it('works for items', async () => {
        const mandatoryCriteria = allMandatoryCriteria[2];
        const itemUpdate = {
          items: [
            {
              id: 5,
              copy: 'The Bank Customer (blah blah).'
            }
          ]
        };

        await as(anEditor).post(mandatoryCriteria).to('/v1/mandatory-criteria');
        await as(anEditor).put(itemUpdate).to(`/v1/mandatory-criteria/${mandatoryCriteria.id}`);

        const { status, body } = await as(anEditor).get(`/v1/mandatory-criteria/${mandatoryCriteria.id}`);

        expect(status).toEqual(200);
        expect(body).toEqual(expectMongoId({
          ...mandatoryCriteria,
          ...itemUpdate,
        }));
      });

      it('reflects properly in the list view', async () => {
        const update = {
          title: 'bananas go here',
          items: [
            {
              id: 5,
              copy: 'The Bank Customer (blah blah).'
            }
          ]
        };

        await as(anEditor).post(allMandatoryCriteria[0]).to('/v1/mandatory-criteria');
        await as(anEditor).post(allMandatoryCriteria[1]).to('/v1/mandatory-criteria');
        await as(anEditor).post(allMandatoryCriteria[2]).to('/v1/mandatory-criteria');
        await as(anEditor).post(allMandatoryCriteria[3]).to('/v1/mandatory-criteria');
        await as(anEditor).post(allMandatoryCriteria[4]).to('/v1/mandatory-criteria');

        const { body: beforeUpdate } = await as(anEditor).get(`/v1/mandatory-criteria`);

        expect(beforeUpdate).toEqual({
          count: 5,
          mandatoryCriteria: expectMongoIds(allMandatoryCriteria),
        });

        await as(anEditor).put(update).to(`/v1/mandatory-criteria/${allMandatoryCriteria[2].id}`);

        const { body: afterUpdate } = await as(anEditor).get(`/v1/mandatory-criteria`);

        expect(afterUpdate).toEqual({
          count: 5,
          mandatoryCriteria: expectMongoIds([
            allMandatoryCriteria[0],
            allMandatoryCriteria[1],
            {
              ...allMandatoryCriteria[2],
              ...update,
            },
            allMandatoryCriteria[3],
            allMandatoryCriteria[4],
          ]),
        });
      });

    })
  });

  describe('DELETE /v1/mandatory-criteria/:id', () => {
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
