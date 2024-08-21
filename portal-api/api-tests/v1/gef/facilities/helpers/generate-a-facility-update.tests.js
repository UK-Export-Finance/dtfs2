const { CURRENCY } = require('@ukef/dtfs2-common');
const { FACILITY_PAYMENT_TYPE } = require('../../../../../src/v1/gef/enums');

const generateACompleteFacilityUpdate = ({ dealVersion }) => {
  const completeUpdate = {
    hasBeenIssued: false,
    name: 'TEST',
    shouldCoverStartOnSubmission: null,
    coverStartDate: new Date(),
    coverEndDate: new Date(),
    monthsOfCover: 12,
    details: ['test', 'test'],
    detailsOther: null,
    currency: { id: CURRENCY.GBP },
    value: 10000000,
    coverPercentage: 75,
    interestPercentage: 10,
    paymentType: 'Monthly',
    dayCountBasis: 365,
    feeType: FACILITY_PAYMENT_TYPE.IN_ADVANCE,
    feeFrequency: 'Monthly',
    coverDateConfirmed: true,
    ukefFacilityId: 1234,
    issueDate: null,
    hasBeenIssuedAndAcknowledged: true,
  };

  if (dealVersion >= 1) {
    completeUpdate.bankReviewDate = new Date().toISOString();
    completeUpdate.facilityEndDate = null;
    completeUpdate.isUsingFacilityEndDate = false;
  }

  return completeUpdate;
};

module.exports.generateACompleteFacilityUpdate = generateACompleteFacilityUpdate;
