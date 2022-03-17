/* eslint-disable no-underscore-dangle */
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const items = require('../../fixtures/gef/eligibilityCriteria');

const baseUrl = '/v1/gef/eligibility-criteria';

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
    await wipeDB.wipe(['eligibility-criteria']);
  });

  describe(`GET ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
    });
  });

  describe(`GET ${baseUrl}/latest`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/latest`);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/latest`);

      expect(status).toEqual(200);
    });

    it('returns the latest eligibilty-criteria version', async () => {
      await as(anEditor).post(items[0]).to(baseUrl);
      await as(anEditor).post(items[1]).to(baseUrl);
      await as(anEditor).post(items[2]).to(baseUrl);

      const { body } = await as(aMaker).get(`${baseUrl}/latest`);

      expect(body).toEqual(expect.objectContaining({
        ...expectMongoId(items[1]),
        createdAt: expect.any(Number),
        terms: expect.any(Array),
      }));
    });
  });

  describe(`GET ${baseUrl}/:version`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('returns a 404 if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(404);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const item = await as(anEditor).post(items[0]).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
    });

    it('returns an eligibility criteria', async () => {
      const item = await as(anEditor).post(items[0]).to(baseUrl);
      const { status, body } = await as(anEditor).get(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
      const expected = {
        ...expectMongoId(items[0]),
        version: items[0].version,
        isInDraft: expect.any(Boolean),
        createdAt: expect.any(Number),
        terms: expect.any(Array),
      };
      expect(body).toEqual(expected);
    });
  });

  describe(`POST ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(items[0]).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aMaker).post(items[0]).to(baseUrl);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(items[0]).to(baseUrl);

      expect(status).toEqual(201);
    });
  });

  // describe(`PUT ${baseUrl}/:version`, () => {
  //   it('rejects requests that do not present a valid Authorization token', async () => {
  //     const { status } = await as().put(updatedMandatoryCriteria).to(`${baseUrl}/1`);
  //     expect(status).toEqual(401);
  //   });

  //   it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
  //     const { status } = await as(aMaker).put(updatedMandatoryCriteria).to(`${baseUrl}/1`);
  //     expect(status).toEqual(401);
  //   });

  //   it('accepts requests that present a valid Authorization token with "editor" role', async () => {
  //     const item = await as(anEditor).post(items[0]).to(baseUrl);
  //     const { status } = await as(anEditor).put(updatedMandatoryCriteria).to(`${baseUrl}/${item.body.version}`);
  //     expect(status).toEqual(200);
  //   });

  //   it('successfully updates item', async () => {
  //     const item = await as(anEditor).post(items[0]).to(baseUrl);
  //     const itemUpdate = {
  //       ...JSON.parse(item.text),
  //       version: 99,
  //       dateCreated: '2021-01-01T00:00',
  //       isInDraft: true,
  //       title: 'test 99',
  //       text: 'Test is a mock test',
  //     };
  //     delete itemUpdate._id; // immutable key

  //     const { status, body } = await as(anEditor).put(itemUpdate).to(`${baseUrl}/${item.body.version}`);

  //     expect(status).toEqual(200);
  //     expect(body).toEqual(expectMongoId({
  //       ...itemUpdate,
  //       updatedAt: expect.any(Number),
  //     }));
  //   });
  // });

  describe(`DELETE ${baseUrl}/:version`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const item = await as(anEditor).post(items[0]).to(baseUrl);
      const { status } = await as().remove(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const item = await as(anEditor).post(items[0]).to(baseUrl);
      const { status } = await as(anEditor).remove(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
    });

    it('deletes the eligibilty-criteria', async () => {
      const { body: createdItem } = await as(anEditor).post(items[0]).to(baseUrl);
      const { body: item } = await as(anEditor).get(`${baseUrl}/${items[0].version}`);

      const { status, body } = await as(anEditor).remove(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
      expect(body).toEqual(item);
    });
  });
});
