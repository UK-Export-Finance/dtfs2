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

describe('/v1/deals/:id/bond/:id/issue-facility', () => {
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

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    facilityStage: 'Unissued',
    previousFacilityStage: 'Unissued',
    ukefGuaranteeInMonths: '24',
    bondBeneficiary: 'test',
    facilityValue: '123456.55',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '9.09',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: 'test',
    status: 'Ready for check'
  };

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let anEditor;
  let dealId;
  let bondId;

  const addBondToDeal = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    bondId = createBondResponse.body.bondId;

    const { status } = await as(aBarclaysMaker).put(allBondFields).to(`/v1/deals/${dealId}/bond/${bondId}`);
    expect(status).toEqual(200);
  };

  const putIssueFacility = async (dealId, bondId, body) => {
    const response = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/bond/${bondId}/issue-facility`);
    return response;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await addBondToDeal();
  });

  describe('PUT /v1/deals/:id/bond/:id/issue-facility', () => {
    // TODO when user does not have acces

    it('should return 404 when bond does not exist', async () => {
      const { status } = await putIssueFacility(dealId, '1234', {});
      expect(status).toEqual(404);
    });

    it('should remove bond status and add issueFacilityDetailsStarted', async () => {
      const issueFacilityBody = {
        uniqueIdentificationNumber: '1234',
      };

      await putIssueFacility(dealId, bondId, issueFacilityBody);

      const updatedBond = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

      // TODO..
      // expect(updatedBond.body.bond.status).toBeUndefined();
      expect(updatedBond.body.bond.issueFacilityDetailsStarted).toEqual(true);
    });

    it('should return 200 with updated bond when no validation errors', async () => {
      const issueFacilityBody = {
        ...createCoverDateFields('requestedCoverStartDate', moment().add(1, 'week')),
        ...createCoverDateFields('coverEndDate', moment().add(1, 'month')),
        ...createCoverDateFields('issuedDate', moment().add(2, 'day')),
        uniqueIdentificationNumber: '1234',
      };

      const { status } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(status).toEqual(200);
      // TODO...
      // expect(body).toEqual(.......);
    });
  });
});
    
