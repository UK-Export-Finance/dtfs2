const CONSTANTS = require('../../../../constants');
const { FACILITY_TYPE, FACILITY_PAYMENT_TYPE } = require('../../enums');

/* eslint-disable consistent-return */
const hasRequiredItems = (doc) => {
  const required = [];
  if (!doc.type) {
    required.push('type');
  }
  if (doc.hasBeenIssued === null) {
    required.push('hasBeenIssued');
  }
  if (doc.hasBeenIssued === true && !doc.name) {
    required.push('name');
  }
  if (doc.hasBeenIssued === true && (doc.shouldCoverStartOnSubmission !== true && !doc.coverStartDate)) {
    required.push('coverStartDate');
  }
  if (doc.hasBeenIssued === true && !doc.coverEndDate) {
    required.push('coverEndDate');
  }
  if (doc.hasBeenIssued === false && !doc.monthsOfCover) {
    required.push('monthsOfCover');
  }
  // doc.details[] sometimes comes through with nulls so strip them out
  const strippedDetails = doc.details ? doc.details.filter((n) => n) : [];
  if (!strippedDetails.length) {
    required.push('details');
  }
  if (strippedDetails && strippedDetails.includes('OTHER') && !doc.detailsOther) {
    required.push('detailsOther');
  }
  if (!doc.currency) {
    required.push('currency');
  }
  if (!doc.value) {
    required.push('value');
  }
  if (!doc.coverPercentage) {
    required.push('coverPercentage');
  }
  if (!doc.interestPercentage) {
    required.push('interestPercentage');
  }
  if (!doc.feeType) {
    required.push('feeType');
  }
  if (doc.feeType !== FACILITY_PAYMENT_TYPE.AT_MATURITY && !doc.feeFrequency) {
    required.push('feeFrequency');
  }
  if (!doc.dayCountBasis) {
    required.push('dayCountBasis');
  }
  return required;
};

const facilitiesStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;
  if (!doc.updatedAt) {
    return CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
  }
  if (requiredCount > 0) {
    return CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
  }
  if (requiredCount === 0) {
    return CONSTANTS.DEAL.DEAL_STATUS.COMPLETED;
  }
};

const facilitiesOverallStatus = (facilities) => {
  let result = CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
  const allStatus = [];
  facilities.forEach((item) => {
    allStatus.push(item.status);
  });
  const uniqueStatus = [...new Set(allStatus)];
  if (uniqueStatus.length > 0) {
    result = CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
  }
  if (uniqueStatus && uniqueStatus.length === 1 && uniqueStatus[0] === CONSTANTS.DEAL.DEAL_STATUS.COMPLETED) {
    result = CONSTANTS.DEAL.DEAL_STATUS.COMPLETED;
  }
  return result;
};

const facilitiesCheckEnums = (doc) => {
  const enumErrors = [];
  switch (doc.type) {
    case FACILITY_TYPE.CASH:
    case FACILITY_TYPE.CONTINGENT:
    case null:
    case undefined:
      break;
    default:
      enumErrors.push({ errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'type' });
      break;
  }

  return enumErrors.length === 0 ? null : enumErrors;
};

const facilitiesValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  facilitiesValidation,
  facilitiesCheckEnums,
  facilitiesOverallStatus,
  facilitiesStatus,
};
