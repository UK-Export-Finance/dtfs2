const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

// jest.unmock('@azure/storage-file-share');

describe('PUT /v1/deals/:id/status - status changes to `Submitted`', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles('maker', 'checker').withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('when the status changes to `Submitted`', () => {
    it('adds a submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      // TODO - since we are running inside the same VM as the service during these tests..
      //  we -can- mock the system clock and do accurate assertions here..
      // feels more unit-test-like but something to think about
      expect(body.deal.details.submissionDate).toBeDefined();
    });

    it('does NOT add a submissionDate to the deal when one already exists', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      // add a mock 'timestamp'/value that we can test against
      const mockSubmissionDate = '123456';
      submittedDeal.details.submissionDate = mockSubmissionDate;

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.submissionDate).toEqual(mockSubmissionDate);
    });

    it('creates type_a xml if deal successfully submitted', async () => {
      const files = [
        {
          filename: 'test-file-1.txt',
          filepath: 'api-tests/fixtures/test-file-1.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test-file-2.txt',
          filepath: 'api-tests/fixtures/test-file-2.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test-file-3.txt',
          filepath: 'api-tests/fixtures/test-file-3.txt',
          fieldname: 'auditedFinancialStatements',
          type: 'financials',
        },
      ];

      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      // Upload supporting docs
      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${createdDeal._id}/eligibility-documentation`);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toBeDefined();
    });
  });

  describe('when the status changes to `Submitted` on invalid deal', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorCount).toBeGreaterThan(0);
      expect(updatedDeal.body.errorCount).toEqual(updatedDeal.body.errorList.length);
    });
  });

  describe('when the status changes to `Submitted` on a deal that has bond facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';
      submittedDeal.bondTransactions.items[0].status = 'Ready for check';
      submittedDeal.bondTransactions.items[0].requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });
  
  describe('when the status changes to `Submitted` on a deal that has loan facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';
      submittedDeal.loanTransactions.items[0].status = 'Ready for check';
      submittedDeal.loanTransactions.items[0].requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });

  describe('when the MIA deal status changes to `Submitted`', () => {
    it('adds an MIA submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));
      submittedDeal.details.submissionType = 'Manual Inclusion Application';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      // TODO - since we are running inside the same VM as the service during these tests..
      //  we -can- mock the system clock and do accurate assertions here..
      // feels more unit-test-like but something to think about
      expect(body.deal.details.submissionDate).toBeDefined();
      expect(body.deal.details.manualInclusionApplicationSubmissionDate).toBeDefined();
    });
  });

  describe('when the status changes to `Ready for Checker\'s approval` on approved MIA', () => {
    it('should add the makers details as MIN maker', async () => {
      const dealCreatedByMaker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          submissionType: 'Manual Inclusion Application',
          previousWorkflowStatus: 'approved',
        },
      };

      const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Ready for Checker\'s approval',
        comments: 'Yay!',
      };

      const updatedDeal = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.body.details.makerMIN.username).toEqual(aBarclaysMaker.username);
    });
  });

  describe('when the status changes to `Submitted` on approved MIA', () => {
    it('should add MIN submissionDate and checkers details as MIN checker', async () => {
      const dealCreatedByMaker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          maker: aBarclaysMakerChecker,
          submissionType: 'Manual Inclusion Application',
          previousWorkflowStatus: 'approved',
        },
      };

      const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.body.details.checkerMIN.username).toEqual(aBarclaysChecker.username);
      expect(updatedDeal.body.details.manualInclusionNoticeSubmissionDate).toBeDefined();
    });
  });
});
