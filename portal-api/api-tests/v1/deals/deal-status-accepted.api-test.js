const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);

describe('PUT /v1/deals/:id/status - to `Accepted by UKEF`', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('when a deal status changes to `Accepted by UKEF (without conditions)`', () => {
    let submittedMinDeal;
    let updatedDeal;

    beforeEach(async () => {
      const minDeal = completedDeal;
      minDeal.details.manualInclusionNoticeSubmissionDate = moment().utc().valueOf();
      minDeal.status = 'Acknowledged';

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(minDeal))).to('/v1/deals');

      submittedMinDeal = postResult.body;

      const statusUpdate = {
        status: 'Accepted by UKEF (without conditions)',
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
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
      minDeal.details.manualInclusionNoticeSubmissionDate = moment().utc().valueOf();
      minDeal.status = 'Acknowledged';

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(minDeal))).to('/v1/deals');

      submittedMinDeal = postResult.body;

      const statusUpdate = {
        status: 'Accepted by UKEF (with conditions)',
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
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
