
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/application';
const collectionName = 'gef-application';

const allItems = require('../../fixtures/gef/application');
const createNewItem = allItems[0];
const updatedItem = {
  ...createNewItem,
  bankInternalRefName: 'Updated Bank Internal Reference Name',
}

describe(baseUrl, () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
  });

  describe(`GET ${baseUrl}`, () => {

    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get(baseUrl);
      expect(status).toEqual(200);
    });

    // it('returns list of all items', async () => {
    //   await as(anEditor).post(allItems[0]).to(baseUrl);
    //   await as(anEditor).post(allItems[1]).to(baseUrl);
    //   await as(anEditor).post(allItems[2]).to(baseUrl);
    //   await as(anEditor).post(allItems[3]).to(baseUrl);
    //   await as(anEditor).post(allItems[4]).to(baseUrl);

    //   const { body } = await as(noRoles).get(baseUrl);

    //   expect(body).toEqual({
    //     count: 5,
    //     data: expect.arrayContaining([
    //       expect.objectContaining(allItems[0]),
    //       expect.objectContaining(allItems[1]),
    //       expect.objectContaining(allItems[2]),
    //       expect.objectContaining(allItems[3]),
    //       expect.objectContaining(allItems[4])
    //     ])
    //   });
    // });

    // it('returns list of all items with pagination', async () => {
    //   await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

    //   const { body } = await as(noRoles).get(baseUrl);

    //   expect(body).toEqual({
    //     count: 5,
    //     mandatoryCriteria: expect.arrayContaining([
    //       expect.objectContaining(allMandatoryCriteria[0]),
    //       expect.objectContaining(allMandatoryCriteria[1]),
    //       expect.objectContaining(allMandatoryCriteria[2]),
    //       expect.objectContaining(allMandatoryCriteria[3]),
    //       expect.objectContaining(allMandatoryCriteria[4])
    //     ])
    //   });
    // });

    // it('returns list of all items with pagination at the start', async () => {
    //   await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

    //   const { body } = await as(noRoles).get(baseUrl);

    //   expect(body).toEqual({
    //     count: 5,
    //     mandatoryCriteria: expect.arrayContaining([
    //       expect.objectContaining(allMandatoryCriteria[0]),
    //       expect.objectContaining(allMandatoryCriteria[1]),
    //       expect.objectContaining(allMandatoryCriteria[2]),
    //       expect.objectContaining(allMandatoryCriteria[3]),
    //       expect.objectContaining(allMandatoryCriteria[4])
    //     ])
    //   });
    // });

    // it('returns list of all items with pagination at the end', async () => {
    //   await as(anEditor).post(allMandatoryCriteria[0]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[1]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[2]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[3]).to(baseUrl);
    //   await as(anEditor).post(allMandatoryCriteria[4]).to(baseUrl);

    //   const { body } = await as(noRoles).get(baseUrl);

    //   expect(body).toEqual({
    //     count: 5,
    //     mandatoryCriteria: expect.arrayContaining([
    //       expect.objectContaining(allMandatoryCriteria[0]),
    //       expect.objectContaining(allMandatoryCriteria[1]),
    //       expect.objectContaining(allMandatoryCriteria[2]),
    //       expect.objectContaining(allMandatoryCriteria[3]),
    //       expect.objectContaining(allMandatoryCriteria[4])
    //     ])
    //   });
    // });

  });

  // describe(`GET ${baseUrl}/:id`, () => {

  //   it('rejects requests that do not present a valid Authorization token', async () => {
  //     const { status } = await as().get(`${baseUrl}/1`);
  //     expect(status).toEqual(401);
  //   });

  //   it('accepts requests that do present a valid Authorization token', async () => {
  //     const { status } = await as(noRoles).get(`${baseUrl}/1`);
  //     expect(status).toEqual(200);
  //   });

  //   it('returns an individual item', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to(baseUrl);

  //     const { status, body } = await as(anEditor).get(`${baseUrl}/1`);

  //     expect(status).toEqual(200);
  //     expect(body).toEqual(expectMongoId(newMandatoryCriteria));
  //   });
  // });

  // describe(`POST ${baseUrl}`, () => {
  //   it('rejects requests that do not present a valid Authorization token', async () => {
  //     const { status } = await as().post(newMandatoryCriteria).to(baseUrl);
  //     expect(status).toEqual(401);
  //   });

  //   it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
  //     const { status } = await as(noRoles).post(newMandatoryCriteria).to(baseUrl);
  //     expect(status).toEqual(401);
  //   });

  //   it('accepts requests that present a valid Authorization token with "editor" role', async () => {
  //     const { status } = await as(anEditor).post(newMandatoryCriteria).to(baseUrl);
  //     expect(status).toEqual(200);
  //   });
  // });

  // describe(`PUT ${baseUrl}/:id`, () => {
  //   it('rejects requests that do not present a valid Authorization token', async () => {
  //     const { status } = await as().put(updatedMandatoryCriteria).to(`${baseUrl}/1`);

  //     expect(status).toEqual(401);
  //   });

  //   it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to(baseUrl);

  //     const { status } = await as(noRoles).put(updatedMandatoryCriteria).to(`${baseUrl}/1`);

  //     expect(status).toEqual(401);
  //   });

  //   it('accepts requests that present a valid Authorization token with "editor" role', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to(baseUrl);

  //     const { status } = await as(anEditor).put(updatedMandatoryCriteria).to(`${baseUrl}/1`);

  //     expect(status).toEqual(200);
  //   });

  //   describe('updating the mandatory-criteria-versioned', () => {
  //     it('works for title field', async () => {
  //       const mandatoryCriteria = allMandatoryCriteria[1];
  //       const titleUpdate = {
  //         title: 'Confirm eligiblity (mandatory criteria)',
  //       };

  //       await as(anEditor).post(mandatoryCriteria).to(baseUrl);
  //       await as(anEditor).put(titleUpdate).to(`${baseUrl}/${mandatoryCriteria.id}`);

  //       const { status, body } = await as(anEditor).get(`${baseUrl}/${mandatoryCriteria.id}`);

  //       expect(status).toEqual(200);
  //       expect(body).toEqual(expectMongoId({
  //         ...mandatoryCriteria,
  //         ...titleUpdate,
  //       }));
  //     });

  //     it('works for items', async () => {
  //       const mandatoryCriteria = allMandatoryCriteria[2];
  //       const itemUpdate = {
  //         version: 99,
  //         dateCreated: "2021-01-01T00:00",
  //         isInDraft: true,
  //         title: 'test 99',
  //         htmlText: `<p>Test is a mock test</p>`
  //       };

  //       await as(anEditor).post(mandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');
  //       await as(anEditor).put(itemUpdate).to(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

  //       const { status, body } = await as(anEditor).get(`/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`);

  //       expect(status).toEqual(200);
  //       expect(body).toEqual(expectMongoId({
  //         ...mandatoryCriteria,
  //         ...itemUpdate,
  //       }));
  //     });

  //   })
  // });

  // describe('DELETE /v1/gef/mandatory-criteria-versioned/:id', () => {
  //   it('rejects requests that do not present a valid Authorization token', async () => {
  //     const { status } = await as().remove('/v1/gef/mandatory-criteria-versioned/1');

  //     expect(status).toEqual(401);
  //   });

  //   it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

  //     const { status } = await as(noRoles).remove('/v1/gef/mandatory-criteria-versioned/1');

  //     expect(status).toEqual(401);
  //   });

  //   it('accepts requests that present a valid Authorization token with "editor" role', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');

  //     const { status } = await as(anEditor).remove('/v1/gef/mandatory-criteria-versioned/1');

  //     expect(status).toEqual(200);
  //   });

  //   it('deletes the mandatory-criteria', async () => {
  //     await as(anEditor).post(newMandatoryCriteria).to('/v1/gef/mandatory-criteria-versioned');
  //     await as(anEditor).remove('/v1/gef/mandatory-criteria-versioned/1');

  //     const { status, body } = await as(anEditor).get('/v1/gef/mandatory-criteria-versioned/1');

  //     expect(status).toEqual(200);
  //     expect(body).toEqual({});
  //   });
  // });
});
