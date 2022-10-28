const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/gef/mandatoryCriteriaVersioned');

const newMandatoryCriteria = allMandatoryCriteria[0];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  title: 'Updated mandatory criteria versioned',
};

const baseUrl = '/v1/gef/mandatory-criteria-versioned';

describe(baseUrl, () => {
  let aMaker;
  let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['mandatoryCriteria']);
  });

  describe('GET /v1/gef/mandatory-criteria-versioned', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/latest', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/latest`);

      expect(status).toEqual(401);
    });

    it('returns the latest mandatory-criteria version', async () => {
      await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

      const { body } = await as(aMaker).get(`${baseUrl}/latest`);

      expect(body).toEqual(expect.objectContaining({
        ...expectMongoId(allMandatoryCriteria[2]),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        introText: expect.any(String),
        criteria: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ]),
      }));
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/12345678`);
      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);

      const { status } = await as(aMaker).get(`${baseUrl}/${item.body.version}`);
      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria-versioned', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status, body } = await as(anEditor).get(`${baseUrl}/${item.body.version}`);
      expect(status).toEqual(200);
      const expected = {
        ...expectMongoId(newMandatoryCriteria),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        criteria: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ]),
      };
      expect(body).toEqual(expected);
    });
  });

  describe('POST /v1/gef/mandatory-criteria-versioned', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newMandatoryCriteria).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aMaker).post(newMandatoryCriteria).to(baseUrl);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);

      expect(status).toEqual(201);
    });
  });

  describe('PUT /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedMandatoryCriteria).to(`${baseUrl}/12345678`);
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aMaker).put(updatedMandatoryCriteria).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(anEditor).put(updatedMandatoryCriteria).to(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('successfully updates item', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const itemUpdate = {
        ...JSON.parse(item.text),
        version: 99,
        isInDraft: true,
        title: 'test 99',
        introText: 'intro 99',
        criteria: [
          { id: '1', body: 'Testing' },
        ],
      };
      delete itemUpdate._id; // immutable key

      const { status } = await as(anEditor).put(itemUpdate).to(`${baseUrl}/${item.body.version}`);

      expect(status).toEqual(200);
      const { body } = await as(aMaker).get(`${baseUrl}/${itemUpdate.version}`);
      expect(body).toEqual(expectMongoId({
        ...itemUpdate,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        dealType: expect.any(String),
        criteria: [
          { id: '1', body: 'Testing' },
        ],
      }));
    });
  });

  describe('DELETE /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as().remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(anEditor).remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      const { body: createdItem } = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      await as(anEditor).get(`${baseUrl}/${createdItem.version}`);

      const { status, body } = await as(anEditor).remove(`${baseUrl}/${createdItem.version}`);
      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
