const moment = require('moment');
const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const createFacilities = require('../../createFacilities');
const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

describe('PUT /v1/deals/:id/status - from `Accepted by UKEF` - facility cover start dates', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  const isUnsubmittedIssuedFacility = (facility) => {
    if ((facility.facilityStage === 'Unissued' || facility.facilityStage === 'Conditional')
      && facility.issueFacilityDetailsProvided
      && !facility.issueFacilityDetailsSubmitted
      && facility.status !== 'Submitted') {
      return facility;
    }
    return null;
  };

  beforeAll(async () => {
    await databaseHelper.wipe(['deals']);
    await databaseHelper.wipe(['facilities']);
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole(MAKER).withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('when a MIN deal status changes from `Accepted by UKEF (without conditions)` to `Ready for Checker\'s approval`', () => {
    let submittedMinDeal;
    let updatedDeal;
    let dealId;

    beforeEach(async () => {
      const minDeal = completedDeal;
      minDeal.details.manualInclusionNoticeSubmissionDate = moment().utc().valueOf();
      minDeal.status = 'Accepted by UKEF (without conditions)';

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(minDeal))).to('/v1/deals');

      dealId = postResult.body._id;

      const { body: getSubmittedDealBody } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

      submittedMinDeal = getSubmittedDealBody.deal;

      completedDeal.mockFacilities.forEach((facility) => {
        if (facility._id) {
          // eslint-disable-next-line no-param-reassign
          delete facility._id;
        }
      });

      const createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

      completedDeal.mockFacilities = createdFacilities;

      const statusUpdate = {
        status: 'Ready for Checker\'s approval',
        comments: 'test',
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
    });

    describe('any issued bonds that have details provided, not yet submitted and no requestedCoverStartDate', () => {
      it('defaults requestedCoverStartDate to the manualInclusionNoticeSubmissionDate', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

        const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
          f.type === 'Bond'
          && isUnsubmittedIssuedFacility(f)
          && !f.requestedCoverStartDate);

        // make sure we have some bonds to test against
        expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

        issuedBondsThatShouldBeUpdated.forEach((bond) => {
          const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);

          expect(updatedBond.requestedCoverStartDate).toEqual(submittedMinDeal.details.manualInclusionNoticeSubmissionDate);
          expect(typeof updatedBond.updatedAt).toEqual('number');
        });
      });
    });

    describe('any issued loans that have details provided, not yet submitted and no requestedCoverStartDate', () => {
      it('defaults requestedCoverStartDate to the manualInclusionNoticeSubmissionDate', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${submittedMinDeal._id}`);

        const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
          f.type === 'Loan'
          && isUnsubmittedIssuedFacility(f)
          && !f.requestedCoverStartDate);

        // make sure we have some loans to test against
        expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

        issuedLoansThatShouldBeUpdated.forEach((loan) => {
          const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
          expect(updatedLoan.requestedCoverStartDate).toEqual(submittedMinDeal.details.manualInclusionNoticeSubmissionDate);
          expect(typeof updatedLoan.updatedAt).toEqual('number');
        });
      });
    });
  });

  describe('when an MIN deal status changes from `Accepted by UKEF (with conditions)` to `Ready for Checker\'s approval`', () => {
    let submittedMinDeal;
    let updatedDeal;

    beforeEach(async () => {
      const minDeal = completedDeal;
      minDeal.details.manualInclusionNoticeSubmissionDate = moment().utc().valueOf();
      minDeal.status = 'Accepted by UKEF (with conditions)';

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(minDeal))).to('/v1/deals');

      const dealId = postResult.body._id;

      const { body: getSubmittedDealBody } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

      submittedMinDeal = getSubmittedDealBody.deal;

      completedDeal.mockFacilities.forEach((facility) => {
        if (facility._id) {
          // eslint-disable-next-line no-param-reassign
          delete facility._id;
        }
      });

      const createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);
      completedDeal.mockFacilities = createdFacilities;

      const statusUpdate = {
        status: 'Ready for Checker\'s approval',
        comments: 'test',
        confirmSubmit: true,
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${submittedMinDeal._id}/status`);
    });

    describe('any issued bonds that have details provided, not yet submitted and no requestedCoverStartDate', () => {
      it('defaults requestedCoverStartDate to the manualInclusionNoticeSubmissionDate', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${submittedMinDeal._id}`);

        const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
          f.type === 'Bond'
          && isUnsubmittedIssuedFacility(f)
          && !f.requestedCoverStartDate);

        // make sure we have some bonds to test against
        expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

        issuedBondsThatShouldBeUpdated.forEach((bond) => {
          const updatedBond = body.deal.bondTransactions.items.find((l) => l._id === bond._id);
          expect(updatedBond.requestedCoverStartDate).toEqual(submittedMinDeal.details.manualInclusionNoticeSubmissionDate);
          expect(typeof updatedBond.updatedAt).toEqual('number');
        });
      });
    });

    describe('any issued loans that have details provided, not yet submitted and no requestedCoverStartDate', () => {
      it('defaults requestedCoverStartDate to the manualInclusionNoticeSubmissionDate', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${submittedMinDeal._id}`);

        const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
          f.type === 'Loan'
          && isUnsubmittedIssuedFacility(f)
          && !f.requestedCoverStartDate);

        // make sure we have some loans to test against
        expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

        issuedLoansThatShouldBeUpdated.forEach((loan) => {
          const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
          expect(updatedLoan.requestedCoverStartDate).toEqual(submittedMinDeal.details.manualInclusionNoticeSubmissionDate);
          expect(typeof updatedLoan.updatedAt).toEqual('number');
        });
      });
    });
  });
});
