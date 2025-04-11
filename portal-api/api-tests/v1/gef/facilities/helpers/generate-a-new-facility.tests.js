const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { DEAL } = require('../../../../../src/constants');

const generateANewFacility = ({ dealId, makerId, dealVersion }) => {
  const facility = {
    status: DEAL.DEAL_STATUS.IN_PROGRESS,
    details: {
      _id: expect.any(String),
      type: expect.any(String),
      dealId,
      hasBeenIssued: false,
      name: null,
      shouldCoverStartOnSubmission: null,
      coverStartDate: null,
      coverEndDate: null,
      monthsOfCover: null,
      details: null,
      detailsOther: null,
      currency: null,
      value: null,
      coverPercentage: null,
      interestPercentage: null,
      paymentType: null,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      ukefExposure: 0,
      guaranteeFee: 0,
      submittedAsIssuedDate: null,
      ukefFacilityId: null,
      dayCountBasis: null,
      feeType: null,
      feeFrequency: null,
      coverDateConfirmed: null,
      canResubmitIssuedFacilities: null,
      issueDate: null,
      unissuedToIssuedByMaker: expect.any(Object),
      hasBeenIssuedAndAcknowledged: null,
      auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(makerId),
    },
    validation: {
      required: ['monthsOfCover', 'details', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
    },
  };

  if (dealVersion >= 1) {
    facility.details.bankReviewDate = null;
    facility.details.facilityEndDate = null;
    facility.details.isUsingFacilityEndDate = null;
    facility.validation.required.unshift('isUsingFacilityEndDate');
  }

  return facility;
};

module.exports.generateANewFacility = generateANewFacility;
