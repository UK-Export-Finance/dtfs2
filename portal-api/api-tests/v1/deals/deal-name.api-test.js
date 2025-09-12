const databaseHelper = require('../../database-helper');
const aDeal = require('./deal-builder');

const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { MAKER, READ_ONLY } = require('../../../server/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newDeal = aDeal({
  updatedAt: Date.now(),
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  status: 'Draft',
  comments: [
    {
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    },
    {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    },
  ],
});

const updatedName = 'a new name';

describe('/v1/deals/:id/additionalRefName', () => {
  let testbank1Maker;
  let testBank1Maker2;
  let testUser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    testUser = testUsers().withRole(READ_ONLY).one();
    const testbank1Makers = testUsers().withRole(MAKER).withBankName('Bank 1').all();
    [testbank1Maker, testBank1Maker2] = testbank1Makers;
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('PUT /v1/deals/:id/additionalRefName', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({ additionalRefName: updatedName }).to('/v1/deals/123456789012/additionalRefName');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUser).put({ additionalRefName: updatedName }).to('/v1/deals/123456789012/additionalRefName');

      expect(status).toEqual(401);
    });

    it('401s requests if <user> != <resource>/maker', async () => {
      const { body } = await as(testbank1Maker).post(newDeal).to('/v1/deals');

      const { status } = await as(testBank1Maker2).put({ additionalRefName: updatedName }).to(`/v1/deals/${body._id}/additionalRefName`);

      expect(status).toEqual(401);
    });

    it('returns the updated additionalRefName', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const { status, text } = await as(testbank1Maker).put({ additionalRefName: updatedName }).to(`/v1/deals/${createdDeal._id}/additionalRefName`);

      expect(status).toEqual(200);
      expect(text).toEqual(updatedName);
    });

    it('updates the deal', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      await as(testbank1Maker).put({ additionalRefName: updatedName }).to(`/v1/deals/${createdDeal._id}/additionalRefName`);

      const { status, body } = await as(testbank1Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.additionalRefName).toEqual(updatedName);
    });

    it('updates the deals updatedAt field', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      await as(testbank1Maker).put({ additionalRefName: updatedName }).to(`/v1/deals/${createdDeal._id}/additionalRefName`);

      const { status, body } = await as(testbank1Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.updatedAt).not.toEqual(newDeal.updatedAt);
    });
  });
});
