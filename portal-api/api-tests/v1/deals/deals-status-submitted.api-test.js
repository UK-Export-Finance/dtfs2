const { sub } = require('date-fns');
const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');
const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

const { as } = require('../../api')(app);

const CONSTANTS = require('../../../src/constants');
const { STATUS } = require('../../../src/constants/user');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('PUT /v1/deals/:id/status - status changes to `Submitted`', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());
  const originalFacilities = completedDeal.mockFacilities;
  const nowDate = new Date();

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole(MAKER).withBankName('Test Bank 1').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Test Bank 1').one();

    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);

    api.tfmDealSubmit = tfmDealSubmitSpy;
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
      expect(body.deal.details.ukefDealId).toEqual(CONSTANTS.NUMBER.UKEF_ID.TEST);

      body.deal.bondTransactions.items.forEach((bond) => {
        expect(bond.ukefFacilityId).toBeDefined();
        expect(bond.ukefFacilityId).toEqual(CONSTANTS.NUMBER.UKEF_ID.TEST);
      });

      body.deal.loanTransactions.items.forEach((loan) => {
        expect(loan.ukefFacilityId).toBeDefined();
        expect(loan.ukefFacilityId).toEqual(CONSTANTS.NUMBER.UKEF_ID.TEST);
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
          const bondInFirstSubmission = dealAfterFirstSubmission.body.bondTransactions.items.find((b) => b._id === bond._id);

          expect(bond.ukefFacilityId).toEqual(bondInFirstSubmission.ukefFacilityId);
        });

        dealAfterSecondSubmission.body.deal.loanTransactions.items.forEach((loan) => {
          const loanInFirstSubmission = dealAfterFirstSubmission.body.loanTransactions.items.find((l) => l._id === loan._id);

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
        'user-status': STATUS.ACTIVE,
        isTrusted: aBarclaysChecker.isTrusted,
      };

      expect(tfmDealSubmitSpy.mock.calls[0][0]).toEqual(dealId);
      expect(tfmDealSubmitSpy.mock.calls[0][1]).toEqual(CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS);
      expect(tfmDealSubmitSpy.mock.calls[0][2]).toEqual(expectedChecker);
    });
  });

  describe('when the status changes to `Submitted` on a deal that has bond facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const modifiedMockFacilities = originalFacilities;
      const firstBond = modifiedMockFacilities.find((f) => f.type === 'Bond');

      firstBond.status = 'Ready for check';
      firstBond.requestedCoverStartDate = sub(nowDate, { days: 1 }).valueOf();

      await createFacilities(aBarclaysMaker, dealId, [firstBond]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual(
        'Requested Cover Start Date must be on the application submission date or in the future',
      );
    });
  });

  describe('when the status changes to `Submitted` on a deal that has loan facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const modifiedMockFacilities = originalFacilities;
      const firstLoan = modifiedMockFacilities.find((f) => f.type === 'Loan');

      firstLoan.status = 'Ready for check';
      firstLoan.requestedCoverStartDate = sub(nowDate, { days: 1 }).valueOf();

      await createFacilities(aBarclaysMaker, dealId, [firstLoan]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual(
        'Requested Cover Start Date must be on the application submission date or in the future',
      );
    });
  });

  describe('when the MIA deal status changes to `Submitted`', () => {
    it('adds an MIA submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));
      submittedDeal.submissionType = 'Manual Inclusion Application';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const dealId = postResult.body._id;

      const mockFacilities = [
        {
          ...completedDeal.mockFacilities[0],
          requestedCoverStartDate: nowDate.valueOf(),
        },
      ];

      await createFacilities(aBarclaysMaker, dealId, mockFacilities);

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
});
