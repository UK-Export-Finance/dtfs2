const databaseHelper = require('../../database-helper');

const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const { MAKER, CHECKER } = require('../../../server/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('PUT /v1/deals/:id/status - to `Accepted by UKEF`', () => {
  let testbank1Maker;
  let testbank1Checker;
  let aSuperuser;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
    const testUsers = await testUserCache.initialise(app);
    const testbank1Makers = testUsers().withRole(MAKER).withBankName('Bank 1').all();
    [testbank1Maker] = testbank1Makers;
    testbank1Checker = testUsers().withRole(CHECKER).withBankName('Bank 1').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('when a deal status changes to `Accepted by UKEF (without conditions)`', () => {
    let submittedMinDeal;
    let updatedDeal;

    beforeEach(async () => {
      const minDeal = completedDeal;
      minDeal.details.manualInclusionNoticeSubmissionDate = new Date().valueOf();
      minDeal.status = 'Acknowledged';

      const postResult = await as(testbank1Maker)
        .post(JSON.parse(JSON.stringify(minDeal)))
        .to('/v1/deals');

      submittedMinDeal = postResult.body;

      const statusUpdate = {
        status: 'Accepted by UKEF (without conditions)',
      };

      updatedDeal = await as(testbank1Checker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
    });

    it('adds an approval date', async () => {
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${submittedMinDeal._id}`);
      expect(body.deal.details.approvalDate).toBeDefined();
      expect(typeof body.deal.details.approvalDate).toEqual('string');
    });
  });

  describe('when a deal status changes to `Accepted by UKEF (with conditions)`', () => {
    let submittedMinDeal;
    let updatedDeal;

    beforeEach(async () => {
      const minDeal = completedDeal;
      minDeal.details.manualInclusionNoticeSubmissionDate = new Date().valueOf();
      minDeal.status = 'Acknowledged';

      const postResult = await as(testbank1Maker)
        .post(JSON.parse(JSON.stringify(minDeal)))
        .to('/v1/deals');

      submittedMinDeal = postResult.body;

      const statusUpdate = {
        status: 'Accepted by UKEF (with conditions)',
      };

      updatedDeal = await as(testbank1Checker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
    });

    it('adds an approval date', async () => {
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${submittedMinDeal._id}`);
      expect(body.deal.details.approvalDate).toBeDefined();
      expect(typeof body.deal.details.approvalDate).toEqual('string');
    });
  });
});
