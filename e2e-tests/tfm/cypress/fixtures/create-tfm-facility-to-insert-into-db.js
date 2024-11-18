const { ObjectId } = require('mongodb');
const { CURRENCY } = require('@ukef/dtfs2-common');

const createTfmFacilityToInsertIntoDb = (ukefFacilityId, dealObjectId) => ({
  _id: new ObjectId(),
  facilitySnapshot: {
    _id: new ObjectId(),
    bondBeneficiary: 'test',
    bondIssuer: 'Issuer',
    bondType: 'Advance payment guarantee',
    'coverEndDate-day': '11',
    'coverEndDate-month': '04',
    'coverEndDate-year': '2024',
    coveredPercentage: '20',
    createdDate: 1710159691178,
    currency: {
      id: CURRENCY.GBP,
      text: 'GBP - UK Sterling',
    },
    currencySameAsSupplyContractCurrency: 'true',
    dayCountBasis: '365',
    dealId: new ObjectId(dealObjectId),
    facilityStage: 'Issued',
    feeFrequency: 'Quarterly',
    feeType: 'At maturity',
    guaranteeFeePayableByBank: '9.0000',
    hasBeenIssued: true,
    issuedDate: '1647001290000',
    minimumRiskMarginFee: '30',
    name: 'Test-123',
    requestedCoverStartDate: '1647001290000',
    riskMarginFee: '10',
    type: 'Bond',
    ukefExposure: '2,469.00',
    ukefFacilityId,
    ukefGuaranteeInMonths: '10',
    updatedAt: 1710159691178,
    value: '1234567890.1',
  },
  tfm: {
    exposurePeriodInMonths: 26,
    facilityGuaranteeDates: {
      effectiveDate: '2022-03-11',
      guaranteeCommencementDate: '2022-03-11',
      guaranteeExpiryDate: '2024-04-11',
    },
    premiumSchedule: null,
    riskProfile: 'Flat',
    ukefExposure: 2469,
    ukefExposureCalculationTimestamp: '1647001290000',
  },
});

module.exports = createTfmFacilityToInsertIntoDb;
