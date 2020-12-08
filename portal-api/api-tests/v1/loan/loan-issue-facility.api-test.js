const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../../../src/v1/section-calculations');
const { findOneCurrency } = require('../../../src/v1/controllers/currencies.controller');

describe('/v1/deals/:id/loan/:id/issue-facility', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      submissionDate: moment().subtract(1, 'day').utc().valueOf(),
      status: 'Ready for Checker\'s approval',
      submissionType: 'Manual Inclusion Notice',
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

  const nowDate = moment();
  const createCoverDateFields = (prefix, value) => {

    return {
      [`${prefix}-day`]: moment(value).format('DD'),
      [`${prefix}-month`]: moment(value).format('MM'),
      [`${prefix}-year`]: moment(value).format('YYYY'),
    };
  };

  const allLoanFields = {
    facilityStage: 'Unconditional',
    previousFacilityStage: 'Unconditional',
    bankReferenceNumber: '1234',
    disbursementAmount: '5',
    facilityValue: '100',
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
    uniqueIdentificationNumber: '1234',
  };

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let anEditor;
  let dealId;
  let loanId;

  const addLoanToDeal = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    loanId = createLoanResponse.body.loanId;

    const { status } = await as(aBarclaysMaker).put(allLoanFields).to(`/v1/deals/${dealId}/loan/${loanId}`);
    expect(status).toEqual(200);
  };

  const putIssueFacility = async (dealId, loanId, body) => {
    const response = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/loan/${loanId}/issue-facility`);
    return response;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await addLoanToDeal();
  });

  describe('PUT /v1/deals/:id/loan/:id/issue-facility', () => {
    it('should return 401 when user cannot access the deal', async () => {
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/issue-facility`);
      expect(status).toEqual(401);
    });

    it('should return 404 when deal does not exist', async () => {
      const { status } = await putIssueFacility('1234', loanId, {});
      expect(status).toEqual(404);
    });

    it('should return 404 when loan does not exist', async () => {
      const { status } = await putIssueFacility(dealId, '1234', {});
      expect(status).toEqual(404);
    });

    it('should return 403 when loan cannot be issued', async () => {
      // put deal into a state that doesn't allow facility issuance
      await as(aSuperuser).put({
        comments: 'test',
        status: 'Abandoned Deal'
      }).to(`/v1/deals/${dealId}/status`);

      const { status } = await putIssueFacility(dealId, loanId, {});
      expect(status).toEqual(403);
    });

    it('should remove loan status and add issueFacilityDetailsStarted', async () => {
      const { body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(body.status === allLoanFields.status).toEqual(false);
      expect(body.issueFacilityDetailsStarted).toEqual(true);
    });

    it('should remove loan status when issueFacilityDetailsStarted already exists in the loan', async () => {
      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      loanId = createLoanResponse.body.loanId;

      const loanWithIssueFacilityDetailsStarted = {
        ...allLoanFields,
        issueFacilityDetailsStarted: true,
        issueFacilityDetailsSubmitted: false,
      };

      const { status } = await as(aBarclaysMaker).put(loanWithIssueFacilityDetailsStarted).to(`/v1/deals/${dealId}/loan/${loanId}`);


      const { body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(body.status).toBeUndefined();
    });


    it('should return 200 with updated loan, add issueFacilityDetailsProvided and generate timestamps', async () => {
      const { status, body } = await putIssueFacility(dealId, loanId, issueFacilityBody);

      expect(status).toEqual(200);
      expect(body.issueFacilityDetailsProvided).toEqual(true);
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

      describe('when there is no loan.bankReferenceNumber', () => {
        it('should return validationErrors, the loan with bankReferenceNumberRequiredForIssuance', async () => {
          // remove bankReferenceNumber
          await as(aBarclaysMaker).put({
            ...allLoanFields,
            bankReferenceNumber: ''
          }).to(`/v1/deals/${dealId}/loan/${loanId}`);

          const { status, body } = await putIssueFacility(dealId, loanId, incompleteIssueFacilityBody);

          expect(status).toEqual(400);
          expect(body.validationErrors).toBeDefined();
          expect(body.loan.bankReferenceNumberRequiredForIssuance).toEqual(true);
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
          expect(body.loan.requestedCoverStartDate).toBeUndefined();
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
          expect(body.loan.issuedDate).toBeUndefined();
        });
      });
    });
  });
});

