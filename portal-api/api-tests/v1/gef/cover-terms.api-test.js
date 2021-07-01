/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');
const {
  STATUS,
} = require('../../../src/v1/gef/enums');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/cover-terms';
const collectionName = 'gef-cover-terms';
const applicationCollectionName = 'gef-application';
const applicationBaseUrl = '/v1/gef/application';
const applicationAllItems = require('../../fixtures/gef/application');

describe(baseUrl, () => {
  let aMaker;
  // let aChecker;
  let applicationItem;
  let newCoverTerms;
  let completeUpdate;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers()
      .withRole('maker')
      .one();
    // aChecker = testUsers()
    //   .withRole('checker')
    //   .one();
    applicationItem = await as(aMaker)
      .post(applicationAllItems[0])
      .to(applicationBaseUrl);
    newCoverTerms = {
      status: STATUS.IN_PROGRESS,
      details: {
        _id: expect.any(String),
        applicationId: applicationItem.body._id,
        coverStart: null,
        noticeDate: null,
        facilityLimit: null,
        exporterDeclaration: null,
        dueDiligence: null,
        facilityLetter: null,
        facilityBaseCurrency: null,
        facilityPaymentCurrency: null,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      },
      validation: {
        required: ['coverStart', 'noticeDate', 'facilityLimit', 'exporterDeclaration',
          'dueDiligence', 'facilityLetter', 'facilityBaseCurrency', 'facilityPaymentCurrency'],
      },
    };
    completeUpdate = {
      coverStart: true,
      noticeDate: true,
      facilityLimit: true,
      exporterDeclaration: true,
      dueDiligence: true,
      facilityLetter: true,
      facilityBaseCurrency: true,
      facilityPaymentCurrency: true,
    };
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as()
        .get(`${baseUrl}/1`);
      expect(status)
        .toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker)
        .post(applicationAllItems[0])
        .to(applicationBaseUrl);
      const { status } = await as(aMaker)
        .get(`${baseUrl}/${item.body.coverTermsId}`);
      expect(status)
        .toEqual(200);
    });

    it(`returns a "${STATUS.NOT_STARTED}" for cover terms`, async () => {
      const item = await as(aMaker)
        .post(applicationAllItems[1])
        .to(applicationBaseUrl);
      const { body } = await as(aMaker)
        .get(`${baseUrl}/${item.body.coverTermsId}`);
      const expected = {
        isAutomaticCover: null,
        rows: ['Eligible for automatic cover?'],
        status: STATUS.NOT_STARTED,
        details: expectMongoId({
          coverStart: null,
          noticeDate: null,
          facilityLimit: null,
          exporterDeclaration: null,
          dueDiligence: null,
          facilityLetter: null,
          facilityBaseCurrency: null,
          facilityPaymentCurrency: null,
          createdAt: expect.any(Number),
          updatedAt: null,
        }),
        validation: {
          required: [
            'coverStart',
            'noticeDate',
            'facilityLimit',
            'exporterDeclaration',
            'dueDiligence',
            'facilityLetter',
            'facilityBaseCurrency',
            'facilityPaymentCurrency',
          ],
        },
      };
      expect(body)
        .toEqual(expected);
    });

    it(`returns a "${STATUS.IN_PROGRESS}" for cover terms`, async () => {
      const item = await as(aMaker)
        .post(applicationAllItems[2])
        .to(applicationBaseUrl);
      const {
        status,
        body,
      } = await as(aMaker)
        .put({
          coverStart: true,
        })
        .to(`${baseUrl}/${item.body.coverTermsId}`);
      const expected = {
        status: STATUS.IN_PROGRESS,
        details: expectMongoId({
          coverStart: true,
          noticeDate: null,
          facilityLimit: null,
          exporterDeclaration: null,
          dueDiligence: null,
          facilityLetter: null,
          facilityBaseCurrency: null,
          facilityPaymentCurrency: null,
          updatedAt: expect.any(Number),
          createdAt: expect.any(Number),
        }),
        validation: {
          required: [
            'noticeDate',
            'facilityLimit',
            'exporterDeclaration',
            'dueDiligence',
            'facilityLetter',
            'facilityBaseCurrency',
            'facilityPaymentCurrency',
          ],
        },
      };
      expect(status)
        .toEqual(200);
      expect(body)
        .toEqual(expected);
    });

    it(`returns "${STATUS.COMPLETED}" cover terms`, async () => {
      const update = {
        coverStart: true,
        noticeDate: true,
        facilityLimit: true,
        exporterDeclaration: true,
        dueDiligence: true,
        facilityLetter: true,
        facilityBaseCurrency: true,
        facilityPaymentCurrency: true,
      };
      const item = await as(aMaker)
        .post(applicationAllItems[2])
        .to(applicationBaseUrl);
      const {
        status,
        body,
      } = await as(aMaker)
        .put(update)
        .to(`${baseUrl}/${item.body.coverTermsId}`);
      const expected = {
        status: STATUS.COMPLETED,
        details: expectMongoId({
          ...update,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
        validation: {
          required: [],
        },
      };
      expect(status)
        .toEqual(200);
      expect(body)
        .toEqual(expected);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker)
        .get(`${baseUrl}/doesnotexist`);
      expect(status)
        .toEqual(204);
    });
  });
});
