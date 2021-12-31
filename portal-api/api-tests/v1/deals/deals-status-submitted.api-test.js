const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');
const externalApis = require('../../../src/reference-data/api');

const { as } = require('../../api')(app);

const CONSTANTS = require('../../../src/constants');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

// jest.unmock('@azure/storage-file-share');

describe('PUT /v1/deals/:id/status - status changes to `Submitted`', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());
  const originalFacilities = completedDeal.mockFacilities;
  const MOCK_NUMBER_GENERATOR_ID = 'MOCK_NUMBER_GENERATOR_ID';

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

    api.tfmDealSubmit = tfmDealSubmitSpy;
    externalApis.numberGenerator = {
      create: () => Promise.resolve({ ukefId: MOCK_NUMBER_GENERATOR_ID }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the status changes to `Submitted`', () => {
    it('adds a submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const dealId = createdDeal._id;

      await createFacilities(aBarclaysMaker, dealId, originalFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.submissionDate).toBeDefined();
    });

    it('does NOT add a submissionDate to the deal when one already exists', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      // add a mock 'timestamp'/value that we can test against
      const mockSubmissionDate = '123456';
      submittedDeal.details.submissionDate = mockSubmissionDate;

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;
      const dealId = createdDeal._id;

      await createFacilities(aBarclaysMaker, dealId, originalFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

      expect(body.deal.details.submissionDate).toEqual(mockSubmissionDate);
    });

    it('increases submissionCount on each submission', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const createdDeal = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const dealId = createdDeal.body._id;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const promises = await Promise.all([
        await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`),
        await as(aSuperuser).get(`/v1/deals/${dealId}`),
      ]);

      const dealAfterSubmission = promises[1];

      expect(dealAfterSubmission.body.deal.details.submissionCount).toEqual(1);
    });

    // NOTE: Workflow integration has been disabled and replaced with TFM integration.
    // Leaving this code here just incase we need to re-enable.
    /*
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
    */
  });

  describe('when the status changes to `Submitted`', () => {
    it('should add UKEF ids to deal and facilities', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const createdDeal = postResult.body;

      await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.ukefDealId).toBeDefined();
      expect(body.deal.details.ukefDealId).toEqual(MOCK_NUMBER_GENERATOR_ID);

      body.deal.bondTransactions.items.forEach((bond) => {
        expect(bond.ukefFacilityId).toBeDefined();
        expect(bond.ukefFacilityId).toEqual(MOCK_NUMBER_GENERATOR_ID);
      });

      body.deal.loanTransactions.items.forEach((loan) => {
        expect(loan.ukefFacilityId).toBeDefined();
        expect(loan.ukefFacilityId).toEqual(MOCK_NUMBER_GENERATOR_ID);
      });
    });

    describe('when the deal has already been submitted', () => {
      it('should NOT add/change the deal and facilities UKEF ids', async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
        const dealId = postResult.body._id;

        await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

        const createdDeal = postResult.body;

        // first submit
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        const dealAfterFirstSubmission = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

        // second submit
        await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

        const dealAfterSecondSubmission = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

        expect(dealAfterSecondSubmission.body.deal.details.ukefDealId).toEqual(dealAfterFirstSubmission.body.details.ukefDealId);

        dealAfterSecondSubmission.body.deal.bondTransactions.items.forEach((bond) => {
          const bondInFirstSubmission = dealAfterFirstSubmission.body.bondTransactions.items.find((b) =>
            b._id === bond._id);

          expect(bond.ukefFacilityId).toEqual(bondInFirstSubmission.ukefFacilityId);
        });

        dealAfterSecondSubmission.body.deal.loanTransactions.items.forEach((loan) => {
          const loanInFirstSubmission = dealAfterFirstSubmission.body.loanTransactions.items.find((l) =>
            l._id === loan._id);

          expect(loan.ukefFacilityId).toEqual(loanInFirstSubmission.ukefFacilityId);
        });
      });
    });

    it('should call api.tfmDealSubmitSpy', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      const expectedChecker = {
        _id: expect.any(Object),
        bank: aBarclaysChecker.bank,
        email: aBarclaysChecker.email,
        username: aBarclaysChecker.username,
        roles: aBarclaysChecker.roles,
        firstname: aBarclaysChecker.firstname,
        surname: aBarclaysChecker.surname,
        timezone: aBarclaysChecker.timezone,
        lastLogin: expect.any(String),
        'user-status': 'active',
      };

      expect(tfmDealSubmitSpy.mock.calls[0][0]).toEqual(dealId);
      expect(tfmDealSubmitSpy.mock.calls[0][1]).toEqual(CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS);
      expect(tfmDealSubmitSpy.mock.calls[0][2]).toEqual(expectedChecker);
    });
  });

  describe('when the status changes to `Submitted` on a deal that has bond facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const modifiedMockFacilities = originalFacilities;
      const firstBond = modifiedMockFacilities.find((f) => f.facilityType === 'bond');

      firstBond.status = 'Ready for check';
      firstBond.requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      await createFacilities(aBarclaysMaker, dealId, [firstBond]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });

  describe('when the status changes to `Submitted` on a deal that has loan facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const modifiedMockFacilities = originalFacilities;
      const firstLoan = modifiedMockFacilities.find((f) => f.facilityType === 'loan');

      firstLoan.status = 'Ready for check';
      firstLoan.requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      await createFacilities(aBarclaysMaker, dealId, [firstLoan]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });

  describe('when the MIA deal status changes to `Submitted`', () => {
    it('adds an MIA submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));
      submittedDeal.submissionType = 'Manual Inclusion Application';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const dealId = postResult.body._id;

      const mockFacilites = [
        {
          ...completedDeal.mockFacilities[0],
          requestedCoverStartDate: moment().utc().valueOf(),
        },
      ];

      await createFacilities(aBarclaysMaker, dealId, mockFacilites);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

      expect(body.deal.details.submissionDate).toBeDefined();
      expect(body.deal.details.manualInclusionApplicationSubmissionDate).toBeDefined();
    });
  });

  describe('when the status changes to `Ready for Checker\'s approval` on approved MIA', () => {
    it('should add the makers details as MIN maker', async () => {
      const dealCreatedByMaker = {
        ...completedDeal,
        submissionType: 'Manual Inclusion Application',
        details: {
          ...completedDeal.details,
          previousWorkflowStatus: 'approved',
        },
      };

      const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
      const dealId = postResult.body._id;

      await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Ready for Checker\'s approval',
        comments: 'Yay!',
      };

      const updatedDeal = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.body.makerMIN.username).toEqual(aBarclaysMaker.username);
    });
  });

  describe('when the status changes to `Submitted` on approved MIA', () => {
    it('should add MIN submissionDate and checkers details as MIN checker', async () => {
      const dealCreatedByMaker = JSON.parse(JSON.stringify({
        ...completedDeal,
        submissionType: 'Manual Inclusion Application',
        details: {
          ...completedDeal.details,
          maker: aBarclaysMaker,
          previousWorkflowStatus: 'approved',
        },
      }));

      const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
      const dealId = postResult.body._id;

      const mockFacilites = [
        {
          ...completedDeal.mockFacilities[0],
          requestedCoverStartDate: moment().utc().valueOf(),
        },
      ];

      await createFacilities(aBarclaysMaker, dealId, mockFacilites);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const { body, status } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(status).toEqual(200);

      expect(body.details.manualInclusionNoticeSubmissionDate).toBeDefined();
      expect(body.details.checkerMIN.username).toEqual(aBarclaysChecker.username);
    });
  });
});
