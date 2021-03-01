/* eslint-disable no-underscore-dangle */
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
  // let noRoles;
  let aMaker;
  let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['gef-mandatoryCriteriaVersioned']);
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

    it('returns a list of mandatory-criteria-versioned sorted by version', async () => {
      await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

      const { body } = await as(aMaker).get(baseUrl);

      expect(body).toEqual({
        count: 5,
        mandatoryCriteria: expect.arrayContaining([
          expect.objectContaining(expectMongoId(allMandatoryCriteria[0])),
          expect.objectContaining(expectMongoId(allMandatoryCriteria[1])),
          expect.objectContaining(expectMongoId(allMandatoryCriteria[2])),
          expect.objectContaining(expectMongoId(allMandatoryCriteria[3])),
          expect.objectContaining(expectMongoId(allMandatoryCriteria[4])),
        ]),
      });
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/latest', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/latest`);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/latest`);

      expect(status).toEqual(200);
    });

    it('returns the latest mandatory-criteria version', async () => {
      await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
      await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

      const { body } = await as(aMaker).get(`${baseUrl}/latest`);

      expect(body).toEqual(expect.objectContaining(expectMongoId(allMandatoryCriteria[2])));
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria-versioned', async () => {
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status, body } = await as(anEditor).get(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newMandatoryCriteria));
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
      const { status } = await as().put(updatedMandatoryCriteria).to(`${baseUrl}/1`);
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
        dateCreated: '2021-01-01T00:00',
        isInDraft: true,
        title: 'test 99',
        htmlText: '<p>Test is a mock test</p>',
      };
      delete itemUpdate._id; // immutable key

      const { status, body } = await as(anEditor).put(itemUpdate).to(`${baseUrl}/${item.body._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId({
        ...itemUpdate,
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
      const item = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
      const { status, body } = await as(anEditor).remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
      expect(body).toEqual(JSON.parse(item.text));
    });
  });
});
