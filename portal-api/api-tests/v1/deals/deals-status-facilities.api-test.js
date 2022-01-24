const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

describe('/v1/deals/:id/status - facilities', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;
  const originalFacilities = completedDeal.mockFacilities;

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
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    aSuperuser = testUsers().superuser().one();
  });

  describe('PUT /v1/deals/:id/status', () => {
    describe('when the status changes from `Further Maker\'s input required` to `Ready for Checker\'s approval`', () => {
      let createdDeal;
      let updatedDeal;
      let dealId;
      let createdFacilities;

      beforeEach(async () => {
        completedDeal.status = 'Further Maker\'s input required';
        completedDeal.details.submissionDate = moment().utc().valueOf();

        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;
        dealId = createdDeal._id;

        const statusUpdate = {
          status: 'Ready for Checker\'s approval',
          comments: 'test',
        };

        const promises = await Promise.all([
          await createFacilities(aBarclaysMaker, dealId, originalFacilities),
          await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`),
        ]);

        const [
          facilities,
          deal,
        ] = promises;

        createdFacilities = facilities;
        completedDeal.mockFacilities = createdFacilities;

        updatedDeal = deal;
      });

      describe('any issued bonds that have details provided, but not yet been submitted', () => {
        it('should add `Ready for check` status, change facilityStage from `Unissued` to `Issued`, add previousFacilityStage', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = body.deal.bondTransactions.items.filter((b) =>
            b.facilityStage === 'Unissued'
            && b.issueFacilityDetailsProvided === true
            && !b.issueFacilityDetailsSubmitted);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            expect(bond.status).toEqual('Ready for check');
            expect(bond.facilityStage).toEqual('Issued');
            expect(bond.previousFacilityStage).toEqual('Unissued');
            expect(typeof bond.updatedAt).toEqual('number');
          });

          const issuedLoansThatShouldBeUpdated = body.deal.loanTransactions.items.filter((l) =>
            l.facilityStage === 'Conditional'
            && l.issueFacilityDetailsProvided === true
            && !l.issueFacilityDetailsSubmitted);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            expect(loan.status).toEqual('Ready for check');
            expect(loan.facilityStage).toEqual('Unconditional');
            expect(loan.previousFacilityStage).toEqual('Conditional');
            expect(typeof loan.updatedAt).toEqual('number');
          });
        });
      });

      describe('any issued loans that have details provided, but not yet been submitted', () => {
        it('should add `Ready for check` status, change facilityStage from `Conditional` to `Unconditional`, add previousFacilityStage', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedLoansThatShouldBeUpdated = body.deal.loanTransactions.items.filter((l) =>
            l.facilityStage === 'Conditional'
            && l.issueFacilityDetailsProvided === true
            && !l.issueFacilityDetailsSubmitted);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            const theLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(theLoan.status).toEqual('Ready for check');
            expect(theLoan.facilityStage).toEqual('Unconditional');
            expect(theLoan.previousFacilityStage).toEqual('Conditional');
            expect(typeof theLoan.updatedAt).toEqual('number');
          });
        });
      });

      describe('when a deal is AIN', () => {
        let ainDeal;

        beforeEach(async () => {
          ainDeal = completedDeal;
          ainDeal.submissionType = 'Automatic Inclusion Notice';

          const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(completedDeal))).to('/v1/deals');

          ainDeal = postResult;
        });

        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(ainDeal.status).toEqual(200);
            expect(ainDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'Bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(updatedBond.requestedCoverStartDate).toEqual(bond.issuedDate);
              expect(typeof updatedBond.updatedAt).toEqual('number');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(ainDeal.status).toEqual(200);
            expect(ainDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'Loan'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(updatedLoan.requestedCoverStartDate).toEqual(loan.issuedDate);
              expect(typeof updatedLoan.updatedAt).toEqual('number');
            });
          });
        });
      });

      describe('when a deal is MIN', () => {
        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'Bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(updatedBond.requestedCoverStartDate).toEqual(bond.issuedDate);
              expect(typeof updatedBond.updatedAt).toEqual('number');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'Loan'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(updatedLoan.requestedCoverStartDate).toEqual(loan.issuedDate);
              expect(typeof updatedLoan.updatedAt).toEqual('number');
            });
          });
        });
      });
    });

    describe('when the status changes to `Ready for Checker\'s approval`', () => {
      describe('when a deal is MIA and has been approved', () => {
        let createdDeal;
        let updatedDeal;
        let dealId;
        let createdFacilities;

        beforeEach(async () => {
          completedDeal.status = 'Accepted by UKEF (without conditions)';
          completedDeal.submissionType = 'Manual Inclusion Application';
          completedDeal.details.approvalDate = moment().utc().valueOf().toString();

          const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

          const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

          createdDeal = postResult.body;
          dealId = createdDeal._id;

          createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

          completedDeal.mockFacilities = createdFacilities;

          const statusUpdate = {
            status: 'Ready for Checker\'s approval',
            comments: 'Nope',
          };

          updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
        });

        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to today if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'Bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(typeof updatedBond.requestedCoverStartDate).toEqual('number');
              expect(typeof updatedBond.updatedAt).toEqual('number');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = createdFacilities.filter((f) =>
              f.facilityType === 'Loan'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(typeof updatedLoan.requestedCoverStartDate).toEqual('number');
              expect(typeof updatedLoan.updatedAt).toEqual('number');
            });
          });
        });
      });
    });

    describe('when the status changes to `Further Maker\'s input required`', () => {
      let createdDeal;
      let updatedDeal;
      let dealId;

      beforeEach(async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

        completedDeal.mockFacilities = createdFacilities;

        const statusUpdate = {
          status: 'Further Maker\'s input required',
          comments: 'Nope',
        };

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      });

      const isIssuedFacilityWithFacilityStageChange = (facility) => {
        const issuedBond = (facility.facilityStage === 'Issued' && facility.previousFacilityStage === 'Unissued');
        const issuedLoan = (facility.facilityStage === 'Unconditional' && facility.previousFacilityStage === 'Conditional');

        if ((issuedBond || issuedLoan)
          && facility.issueFacilityDetailsProvided
          && !facility.issueFacilityDetailsSubmitted) {
          return facility;
        }
        return null;
      };

      describe('all issued bonds (facilityStage=`Issued`, previousFacilityStage=`Unissued`)', () => {
        it('should add `Maker’s input required` status to the bond', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Bond'
            && isIssuedFacilityWithFacilityStageChange(f));

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(updatedBond.status).toEqual('Maker\'s input required');
            expect(typeof updatedBond.updatedAt).toEqual('number');
          });
        });
      });

      describe('any issued loans (facilityStage=`Unconditional`, previousFacilityStage=`Conditional`)', () => {
        it('should add `Maker’s input required` status to the loan', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Loan'
            && isIssuedFacilityWithFacilityStageChange(f));

          // make sure we have some loans to test against
          expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(updatedLoan.status).toEqual('Maker\'s input required');
            expect(typeof updatedLoan.updatedAt).toEqual('number');
          });
        });
      });
    });

    describe('when the deal status changes from `Draft` to `Ready for Checker\'s approval`', () => {
      let createdDeal;
      let updatedDeal;
      let dealId;

      const statusUpdate = {
        comments: 'Ready to go!',
        status: 'Ready for Checker\'s approval',
      };

      const coverEndDate = () => ({
        'coverEndDate-day': moment().add(1, 'month').format('DD'),
        'coverEndDate-month': moment().add(1, 'month').format('MM'),
        'coverEndDate-year': moment().add(1, 'month').format('YYYY'),
      });

      const baseBond = {
        facilityType: 'Bond',
        bondIssuer: 'issuer',
        bondType: 'bond type',
        bondBeneficiary: 'test',
        value: '123',
        currencySameAsSupplyContractCurrency: 'true',
        riskMarginFee: '1',
        coveredPercentage: '2',
        feeType: 'test',
        feeFrequency: 'test',
        dayCountBasis: '365',
        currency: { id: 'EUR', text: 'Euros' },
      };

      const issuedBondFields = () => ({
        facilityStage: 'Issued',
        hasBeenIssued: true,
        uniqueIdentificationNumber: '1234',
        ...coverEndDate(),
      });

      const newBonds = [
        {
          ...baseBond,
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          ukefGuaranteeInMonths: '24',
        },
        {
          ...baseBond,
          ...issuedBondFields(),
        },
        {
          ...baseBond,
          ...issuedBondFields(),
        },
      ];

      const conditionalLoan = () => ({
        facilityType: 'Loan',
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        ukefGuaranteeInMonths: '12',
        value: '100',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        currency: { id: 'EUR', text: 'Euros' },
      });

      const unconditionalLoan = () => ({
        facilityType: 'Loan',
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        value: '100',
        bankReferenceNumber: '1234',
        ...coverEndDate(),
        disbursementAmount: '5',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        currency: { id: 'EUR', text: 'Euros' },
      });

      const newLoans = [
        conditionalLoan(),
        unconditionalLoan(),
        unconditionalLoan(),
      ];

      const newFacilities = [
        ...newBonds,
        ...newLoans,
      ];

      beforeEach(async () => {
        const dealInDraftStatus = completedDeal;
        dealInDraftStatus.status = 'Draft';

        const deal = JSON.parse(JSON.stringify(dealInDraftStatus));

        const postResult = await as(aBarclaysMaker).post(deal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, newFacilities);

        completedDeal.mockFacilities = createdFacilities;

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      });

      describe('when a deal contains bonds with an `Issued` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such bonds', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

          expect(body.deal.bondTransactions.items[0]).toEqual({
            ...newBonds[0],
            status: 'Completed',
            updatedAt: expect.any(Number),
            createdDate: expect.any(Number),
            requestedCoverStartDate: expect.any(Number),
            _id: expect.any(String),
            dealId,
          });

          expect(body.deal.bondTransactions.items[1]).toEqual({
            ...newBonds[1],
            status: 'Completed',
            updatedAt: expect.any(Number),
            createdDate: expect.any(Number),
            requestedCoverStartDate: expect.any(Number),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            dealId,
          });

          expect(body.deal.bondTransactions.items[2]).toEqual({
            ...newBonds[2],
            status: 'Completed',
            updatedAt: expect.any(Number),
            createdDate: expect.any(Number),
            requestedCoverStartDate: expect.any(Number),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            dealId,
          });
        });
      });

      describe('when a deal contains loans with an `Unconditional` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such loans', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

          expect(body.deal.loanTransactions.items[1]).toEqual({
            ...newLoans[1],
            status: 'Completed',
            updatedAt: expect.any(Number),
            createdDate: expect.any(Number),
            requestedCoverStartDate: expect.any(Number),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            dealId,
          });

          expect(body.deal.loanTransactions.items[2]).toEqual({
            ...newLoans[2],
            status: 'Completed',
            updatedAt: expect.any(Number),
            createdDate: expect.any(Number),
            requestedCoverStartDate: expect.any(Number),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            dealId,
          });
        });
      });
    });

    describe('when the status changes to `Submitted`', () => {
      let createdDeal;
      let updatedDeal;
      let expectedFacilitiesSubmittedBy;
      let dealId;

      beforeEach(async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        api.tfmDealSubmit = () => Promise.resolve();

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, originalFacilities);

        completedDeal.mockFacilities = createdFacilities;

        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

        expectedFacilitiesSubmittedBy = aBarclaysChecker;
      });

      const isUnsubmittedFacilityWithIssueFacilityDetailsProvided = (facility) => {
        const issuedBond = facility.facilityStage === 'Issued';
        const unconditionalLoan = facility.facilityStage === 'Unconditional';

        if ((issuedBond || unconditionalLoan)
          && facility.issueFacilityDetailsProvided
          && facility.status === 'Ready for check') {
          return facility;
        }
        return null;
      };

      describe('any unconditional loans', () => {
        it('should add issuedFacilitySubmittedToUkefTimestamp, issuedFacilitySubmittedToUkefBy and updatedAt', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const unconditionalLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Loan'
            && f.facilityStage === 'Unconditional');

          // make sure we have some loans to test against
          expect(unconditionalLoansThatShouldBeUpdated.length > 0).toEqual(true);

          unconditionalLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(typeof updatedLoan.updatedAt).toEqual('number');
            expect(typeof updatedLoan.issuedFacilitySubmittedToUkefTimestamp).toEqual('number');
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.username).toEqual(expectedFacilitiesSubmittedBy.username);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.email).toEqual(expectedFacilitiesSubmittedBy.email);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.firstname).toEqual(expectedFacilitiesSubmittedBy.firstname);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.lastname).toEqual(expectedFacilitiesSubmittedBy.lastname);
          });
        });
      });

      describe('any issued bonds', () => {
        it('should add issuedFacilitySubmittedToUkefTimestamp, issuedFacilitySubmittedToUkefBy and updatedAt', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Bond'
            && f.facilityStage === 'Issued');

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(typeof updatedBond.updatedAt).toEqual('number');
            expect(typeof updatedBond.issuedFacilitySubmittedToUkefTimestamp).toEqual('number');
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.username).toEqual(expectedFacilitiesSubmittedBy.username);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.email).toEqual(expectedFacilitiesSubmittedBy.email);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.firstname).toEqual(expectedFacilitiesSubmittedBy.firstname);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.lastname).toEqual(expectedFacilitiesSubmittedBy.lastname);
          });
        });
      });

      describe('any unconditional loans that have Issue Facility Form details provided (issueFacilityDetailsProvided) and status=`Ready for check`', () => {
        it('should add `Submitted` status and `issueFacilityDetailsSubmitted` property', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const unconditionalLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Loan'
            && isUnsubmittedFacilityWithIssueFacilityDetailsProvided(f));

          // make sure we have some loans to test against
          expect(unconditionalLoansThatShouldBeUpdated.length > 0).toEqual(true);

          unconditionalLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(updatedLoan.issueFacilityDetailsSubmitted).toEqual(true);
            expect(updatedLoan.status).toEqual('Submitted');
            expect(typeof updatedLoan.updatedAt).toEqual('number');
          });
        });
      });

      describe('any issued bonds that have Issue Facility Form details provided (issueFacilityDetailsProvided) and status=`Ready for check`', () => {
        it('should add `Submitted` status and `issueFacilityDetailsSubmitted` property', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'Bond'
            && isUnsubmittedFacilityWithIssueFacilityDetailsProvided(f));

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(updatedBond.issueFacilityDetailsSubmitted).toEqual(true);
            expect(updatedBond.status).toEqual('Submitted');
            expect(typeof updatedBond.updatedAt).toEqual('number');
          });
        });
      });
    });
  });
});
