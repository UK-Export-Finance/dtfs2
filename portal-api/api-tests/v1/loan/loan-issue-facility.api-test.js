const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/loan/:id/issue-facility', () => {
  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Ready for Checker\'s approval',
    details: {
      submissionDate: moment().subtract(1, 'day').utc().valueOf(),
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
    eligibility: {
      criteria: [
        { id: 15, answer: true },
      ],
    },
  });

  const createCoverDateFields = (prefix, value) => ({
    [`${prefix}-day`]: moment(value).format('DD'),
    [`${prefix}-month`]: moment(value).format('MM'),
    [`${prefix}-year`]: moment(value).format('YYYY'),
  });

  const allLoanFields = {
    facilityStage: 'Unconditional',
    hasBeenIssued: true,
    previousFacilityStage: 'Unconditional',
    name: '1234',
    disbursementAmount: '5',
    value: '100',
    currencySameAsSupplyContractCurrency: 'true',
    interestMarginFee: '10',
    coveredPercentage: '40',
    premiumType: 'At maturity',
    dayCountBasis: '365',
    ...createCoverDateFields('coverEndDate', moment().add(1, 'month')),
    status: 'Ready for check',
  };

  const issueFacilityBody = {
    ...createCoverDateFields('requestedCoverStartDate', moment().add(1, 'week')),
    ...createCoverDateFields('coverEndDate', moment().add(1, 'month')),
    ...createCoverDateFields('issuedDate', moment()),
    name: '1234',
  };

  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let dealId;
  let loanId;

  const createLoan = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = deal.body._id; 

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    loanId = createLoanResponse.body.loanId;

    const { status, body } = await as(aBarclaysMaker).put(allLoanFields).to(`/v1/deals/${dealId}/loan/${loanId}`);
    expect(body.hasBeenIssued).toEqual(true);
    expect(status).toEqual(200);
  };

  const putIssueFacility = async (issueFacilityDealId, issueFacilityLoanId, body) => {
    const response = await as(aBarclaysMaker).put(body).to(`/v1/deals/${issueFacilityDealId}/loan/${issueFacilityLoanId}/issue-facility`);
    return response;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await createLoan();
  });

  describe('PUT /v1/deals/:id/loan/:id/issue-facility', () => {
    it('should return 401 when user cannot access the deal', async () => {
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/issue-facility`);
      expect(status).toEqual(401);
    });

    it('should return 404 when deal does not exist', async () => {
      const { status } = await putIssueFacility('123456789012', loanId, {});
      expect(status).toEqual(404);
    });

    it('should return 404 when loan does not exist', async () => {
      const { status } = await putIssueFacility(dealId, '123456789012', {});
      expect(status).toEqual(404);
    });

    it('should return 403 when loan cannot be issued', async () => {
      // put deal into a state that doesn't allow facility issuance
      await as(aSuperuser).put({
        comments: 'test',
        status: 'Abandoned'
      }).to(`/v1/deals/${dealId}/status`);

      const { status } = await putIssueFacility(dealId, loanId, {});
      expect(status).toEqual(403);
    });

    it('should remove loan status and add issueFacilityDetailsStarted', async () => {
      const { body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(body.status === allLoanFields.status).toEqual(false);
      expect(body.issueFacilityDetailsStarted).toEqual(true);
      expect(body.hasBeenIssued).toEqual(true);
    });

    it('should remove loan status when issueFacilityDetailsStarted already exists in the loan', async () => {
      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      loanId = createLoanResponse.body.loanId;

      const loanWithIssueFacilityDetailsStarted = {
        ...allLoanFields,
        issueFacilityDetailsStarted: true,
        issueFacilityDetailsSubmitted: false,
      };

      await as(aBarclaysMaker).put(loanWithIssueFacilityDetailsStarted).to(`/v1/deals/${dealId}/loan/${loanId}`);

      const { body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(body.status).toEqual(null);
    });

    it('should return 200 with updated loan, add issueFacilityDetailsProvided and generate timestamps', async () => {
      const { status, body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(status).toEqual(200);
      expect(body.issueFacilityDetailsProvided).toEqual(true);
      expect(body.hasBeenIssued).toEqual(true);
      expect(typeof body.requestedCoverStartDate === 'string').toEqual(true);
      expect(typeof body.issuedDate === 'string').toEqual(true);
    });

    describe('with validation errors', () => {
      const incompleteIssueFacilityBody = {
        ...createCoverDateFields('requestedCoverStartDate', moment().add(1, 'week')),
      };

      it('should return 400 with validationErrors, the loan,  and add issueFacilityDetailsProvided=false', async () => {
        const { status, body } = await putIssueFacility(dealId, loanId, incompleteIssueFacilityBody);

        expect(status).toEqual(400);
        expect(body.validationErrors).toBeDefined();
        expect(body.loan.issueFacilityDetailsProvided).toEqual(false);
      });

      describe('when there is no loan.name', () => {
        it('should return validationErrors, the loan with nameRequiredForIssuance', async () => {
          // remove name
          await as(aBarclaysMaker).put({
            ...allLoanFields,
            name: ''
          }).to(`/v1/deals/${dealId}/loan/${loanId}`);

          const { status, body } = await putIssueFacility(dealId, loanId, incompleteIssueFacilityBody);

          expect(status).toEqual(400);
          expect(body.validationErrors).toBeDefined();
          expect(body.loan.nameRequiredForIssuance).toEqual(true);
        });
      });

      describe('when requestedCoverStartDate exists and only some values are updated', () => {
        it('should remove requestedCoverStartDate timestamp', async () => {
          await putIssueFacility(dealId, loanId, issueFacilityBody);

          const incompleteDate = {
            'requestedCoverStartDate-day': moment().format('DD'),
            'requestedCoverStartDate-month': moment().format('MM'),
            'requestedCoverStartDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, loanId, incompleteDate);
          expect(body.loan.requestedCoverStartDate).toEqual(null);
        });
      });

      describe('when issuedDate exists and only some values are updated', () => {
        it('should remove issuedDate timestamp', async () => {
          await putIssueFacility(dealId, loanId, issueFacilityBody);

          const incompleteDate = {
            'issuedDate-day': moment().format('DD'),
            'issuedDate-month': moment().format('MM'),
            'issuedDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, loanId, incompleteDate);
          expect(body.loan.issuedDate).toEqual(null);
        });
      });
    });
  });
});
