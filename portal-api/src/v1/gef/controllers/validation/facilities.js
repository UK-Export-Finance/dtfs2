const { STATUS, PAYMENT_TYPE, FACILITY_TYPE } = require('../../enums');

/* eslint-disable consistent-return */
const hasRequiredItems = (doc) => {
  const required = [];
  if (!doc.type) {
    required.push('type');
  }
  if (!doc.hasBeenIssued) {
    required.push('hasBeenIssued');
  }
  if (!doc.name) {
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
  if (!doc.details) {
    required.push('details');
  }
  if (doc.details && doc.details.length > 0 && doc.details.includes('other') && !doc.detailsOther) {
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
  // if (doc.paymentType === null) {
  //   required.push('paymentType');
  // }
  return required;
};

const facilitiesStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;
  if (!doc.updatedAt) {
    return STATUS.NOT_STARTED;
  }
  if (requiredCount > 0) {
    return STATUS.IN_PROGRESS;
  }
  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }
};

const facilitiesOverallStatus = (facilities) => {
  let result = STATUS.NOT_STARTED;
  const allStatus = [];
  facilities.forEach((item) => {
    allStatus.push(item.status);
  });
  const uniqueStatus = [...new Set(allStatus)];
  if (uniqueStatus.length > 0) {
    result = STATUS.IN_PROGRESS;
  }
  if (uniqueStatus && uniqueStatus.length === 1 && uniqueStatus[0] === STATUS.COMPLETED) {
    result = STATUS.COMPLETED;
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
  switch (doc.paymentType) {
    case PAYMENT_TYPE.IN_ARREARS_QUARTLY:
    case PAYMENT_TYPE.IN_ADVANCE_QUARTERLY:
    case null:
    case undefined:
      break;
    default:
      enumErrors.push({ errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'paymentType' });
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
