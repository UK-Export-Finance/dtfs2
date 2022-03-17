const V2_CONSTANTS = require('../../../portal-api/src/constants');
const {
  hasValue,
  isNumber,
  hasBooleanValue,
  hasObjectValues,
} = require('../helpers/field-checks');
const log = require('../logs');

const dealMappingErrors = (v2Deal, v1DealId) => {
  const errors = [];

  if (!hasValue(v2Deal.bankInternalRefName)) {
    errors.push('bankInternalRefName');
  }
  if (!hasValue(v2Deal.submissionType)) {
    errors.push('submissionType');
  }
  if (!hasValue(v2Deal.status)) {
    errors.push('status');
  }
  if (!isNumber(v2Deal.submissionDate)) {
    errors.push('submissionDate');
  }
  if (!hasValue(v2Deal.ukefDealId)) {
    errors.push('ukefDealId');
  }
  if (!hasObjectValues(v2Deal.exporter)) {
    errors.push('exporter');
  }
  if (!isNumber(v2Deal.eligibility.version)) {
    errors.push('eligibility.version');
  }
  if (!hasValue(v2Deal.eligibility.criteria)) {
    errors.push('eligibility.criteria');
  }
  if (!isNumber(v2Deal.submissionCount)) {
    errors.push('submissionCount');
  }
  if (!isNumber(v2Deal.mandatoryVersionId)) {
    errors.push('mandatoryVersionId');
  }
  if (!hasValue(v2Deal.comments)) {
    errors.push('comments');
  }

  if (v2Deal.submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
    if (!isNumber(v2Deal.manualInclusionNoticeSubmissionDate)) {
      errors.push('manualInclusionNoticeSubmissionDate');
    }
  }

  if (v2Deal.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS
    || v2Deal.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS) {
    if (!hasBooleanValue(v2Deal.ukefDecisionAccepted)) {
      errors.push('ukefDecisionAccepted');
    }
  }

  if (errors.length) {
    errors.forEach((error) => {
      log.addError(v1DealId, `Error with deal mapping - ${error}`);
    });
    return errors;
  }

  return false;
};

const facilityMappingErrors = (v2Facility) => {
  const errors = [];

  if (!hasValue(v2Facility.type)) {
    errors.push('type');
  }
  if (!hasValue(v2Facility.ukefFacilityId)) {
    errors.push('ukefFacilityId');
  }
  if (!hasBooleanValue(v2Facility.hasBeenIssued)) {
    errors.push('v2Facility');
  }
  if (!isNumber(v2Facility.value)) {
    errors.push('value');
  }
  if (!hasValue(v2Facility.currency.id)) {
    errors.push('currency');
  }
  if (!isNumber(v2Facility.coverPercentage)) {
    errors.push('coverPercentage');
  }
  if (!isNumber(v2Facility.interestPercentage)) {
    errors.push('interestPercentage');
  }
  if (!hasValue(v2Facility.feeType)) {
    errors.push('feeType');
  }
  if (!isNumber(v2Facility.dayCountBasis)) {
    errors.push('dayCountBasis');
  }
  if (!isNumber(v2Facility.ukefExposure)) {
    errors.push('ukefExposure');
  }
  if (!isNumber(v2Facility.guaranteeFee)) {
    errors.push('guaranteeFee');
  }
  if (!isNumber(v2Facility.monthsOfCover)) {
    errors.push('monthsOfCover');
  }
  if (!isNumber(v2Facility.coverStartDate)) {
    errors.push('coverStartDate');
  }
  if (!isNumber(v2Facility.coverEndDate)) {
    errors.push('coverEndDate');
  }
  if (!hasBooleanValue(v2Facility.coverDateConfirmed)) {
    errors.push('coverDateConfirmed');
  }
  if (!hasBooleanValue(v2Facility.shouldCoverStartOnSubmission)) {
    errors.push('shouldCoverStartOnSubmission');
  }
  if (!hasBooleanValue(v2Facility.hasBeenIssuedAndAcknowledged)) {
    errors.push('hasBeenIssuedAndAcknowledged');
  }

  if (v2Facility.hasBeenIssued) {
    if (!isNumber(v2Facility.issuedDate)) {
      errors.push('issuedDate');
    }
    if (!isNumber(v2Facility.submittedAsIssuedDate)) {
      errors.push('submittedAsIssuedDate');
    }
  }

  return errors;
};

const facilitiesMappingErrors = (v2Facilities, v1DealId) => {
  const errors = [];

  v2Facilities.forEach((f) => {
    const facilityErrors = facilityMappingErrors(f);
    if (facilityErrors?.length) {
      errors.push(...facilityErrors);
    }
  });

  if (errors.length) {
    errors.forEach((error) => {
      log.addError(v1DealId, `Error with facility mapping - ${error}`);
    });
    return errors;
  }

  return false;
};


module.exports = {
  dealMappingErrors,
  facilitiesMappingErrors,
};
