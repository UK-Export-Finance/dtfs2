/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/application';
const collectionName = 'gef-application';

const allItems = require('../../fixtures/gef/application');

describe(baseUrl, () => {
  // let noRoles;
  let aMaker;
  let aChecker;
  // let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
    // anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
  });

  describe(`GET ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('returns list of all items', async () => {
      await as(aMaker).post(allItems[0]).to(baseUrl);
      await as(aMaker).post(allItems[1]).to(baseUrl);
      await as(aMaker).post(allItems[2]).to(baseUrl);
      await as(aMaker).post(allItems[3]).to(baseUrl);
      await as(aMaker).post(allItems[4]).to(baseUrl);
      await as(aMaker).post(allItems[5]).to(baseUrl);
      await as(aMaker).post(allItems[6]).to(baseUrl);
      await as(aMaker).post(allItems[7]).to(baseUrl);
      await as(aMaker).post(allItems[8]).to(baseUrl);
      await as(aMaker).post(allItems[9]).to(baseUrl);
      await as(aMaker).post(allItems[10]).to(baseUrl);
      await as(aMaker).post(allItems[11]).to(baseUrl);
      await as(aMaker).post(allItems[12]).to(baseUrl);
      await as(aMaker).post(allItems[13]).to(baseUrl);
      await as(aMaker).post(allItems[14]).to(baseUrl);
      await as(aMaker).post(allItems[15]).to(baseUrl);


      // MW: couldn't get the promise.all running in sequential order
      // await allItems.map(async (item) => {
      //   return as(aMaker).post(item).to(baseUrl);
      // })

      // await Promise.all(promise);

      const { body, status } = await as(aChecker).get(baseUrl);

      const expected = {
        items: allItems.map((item) => ({
          ...expectMongoId(item),
          exporterId: expect.any(String),
          coverTermsId: expect.any(String),
          createdAt: expect.any(Number),  
          status: 'Draft',
          dealType: 'GEF',
          submissionCount: 0,
          submissionType: null,
        })),
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns an individual item', async () => {
      const item = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      const expected = {
        ...allItems[0],
        exporterId: expect.any(String),
        coverTermsId: expect.any(String),
        status: 'Draft',
        createdAt: expect.any(Number),
        dealType: 'GEF',
        submissionCount: 0,
        submissionType: null,
      };
      expect(body).toEqual(expectMongoId(expected));
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`GET ${baseUrl}/status/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/status/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a status', async () => {
      const item = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/status/${item.body._id}`);
      expect(body).toEqual({ status: 'Draft' });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`POST ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(allItems[0]).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { status } = await as(aMaker).post(allItems[0]).to(baseUrl);
      expect(status).toEqual(201);
    });

    it('returns me a new application upon creation', async () => {
      const { body } = await as(aMaker).post(allItems[0]).to(baseUrl);
      const expected = {
        ...allItems[0],
        exporterId: expect.any(String),
        coverTermsId: expect.any(String),
        status: 'Draft',
        createdAt: expect.any(Number),
        dealType: 'GEF',
        submissionCount: 0,
        submissionType: null,
      };
      expect(body).toEqual(expectMongoId(expected));
    });

    it('it returns a duplicate error in the system the item I created an application of the same reference', async () => {
      await as(aMaker).post(allItems[0]).to(baseUrl); // 1st instance
      const { status, body } = await as(aMaker).post(allItems[0]).to(baseUrl); // 2nd instance
      expect(body).toEqual([{
        errCode: 'ALREADY_EXISTS',
        errRef: 'bankInternalRefName',
        errMsg: 'The bank reference you have entered already exists.',
      }]);
      expect(status).toEqual(422);
    });

    it('it tells me the Bank Internal Ref Name is null', async () => {
      const removeName = {
        ...allItems[0],
        bankInternalRefName: null,
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);
      expect(body).toEqual([{
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'Application Reference Name is Mandatory',
      }]);
      expect(status).toEqual(422);
    });

    it('it tells me the Bank Internal Ref Name is an empty string', async () => {
      const removeName = {
        ...allItems[0],
        bankInternalRefName: '',
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);
      expect(body).toEqual([{
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'Application Reference Name is Mandatory',
      }]);
      expect(status).toEqual(422);
    });
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    const updated = {
      ...allItems[0],
      bankInternalRefName: 'Updated Ref Name (Unit Test)',
      submissionType: 'Automatic Inclusion Notice',
    };

    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updated).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/${body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`PUT ${baseUrl}/status/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({ status: 'COMPLETED' }).to(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(allItems[0]).to(baseUrl);
      const { status } = await as(aMaker).put({ status: 'COMPLETED' }).to(`${baseUrl}/status/${body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a enum error if an incorrect status is sent', async () => {
      const { body } = await as(aMaker).post(allItems[0]).to(baseUrl);
      const res = await as(aMaker).put({ status: 'NOT_A_STATUS' }).to(`${baseUrl}/status/${body._id}`);
      expect(res.status).toEqual(422);
      expect(res.body).toEqual([{
        errCode: 'ENUM_ERROR',
        errRef: 'status',
        errMsg: 'Unrecognised enum',
      }]);
    });

    describe('when new status is `SUBMITTED_TO_UKEF`', () => {
      it('increases submissionCount', async () => {
        const { body } = await as(aMaker).post(allItems[0]).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionCount).toEqual(1);
      });
    });

    it('returns a 404 when application does not exist', async () => {
      const { status } = await as(aMaker).put({ status: 'COMPLETED' }).to(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(404);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(allItems[0]).to(`${baseUrl}`);
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(body._id)}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });
});
