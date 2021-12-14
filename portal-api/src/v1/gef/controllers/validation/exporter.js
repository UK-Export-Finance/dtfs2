/* eslint-disable consistent-return */

const { SME_TYPE, STATUS } = require('../../enums');

const TOTAL_REQUIRED = 8;

const hasRequiredItems = (doc) => {
  const required = [];

  if (!doc.companiesHouseRegistrationNumber) {
    required.push('companiesHouseRegistrationNumber');
  }
  if (!doc.companyName) {
    required.push('companyName');
  }
  if (!doc.registeredAddress) {
    required.push('registeredAddress');
  }
  if (!doc.selectedIndustry) {
    required.push('selectedIndustry');
  }
  if (!doc.industries) {
    required.push('industries');
  }
  if (!doc.smeType) {
    required.push('smeType');
  }
  if (!doc.probabilityOfDefault) {
    required.push('probabilityOfDefault');
  }
  if (!doc.isFinanceIncreasing) {
    required.push('isFinanceIncreasing');
  }
  return required;
};

const exporterStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;

  if (requiredCount === TOTAL_REQUIRED) {
    return STATUS.NOT_STARTED;
  }

  if (requiredCount > 0) {
    return STATUS.IN_PROGRESS;
  }
  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }

  return STATUS.IN_PROGRESS;
};

const exporterCheckEnums = (doc) => {
  const enumErrors = [];
  switch (doc.smeType) {
    case SME_TYPE.MICRO:
    case SME_TYPE.SMALL:
    case SME_TYPE.MEDIUM:
    case SME_TYPE.NOT_SME:
    case null:
    case undefined:
      break;
    default:
      enumErrors.push({ errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'smeType' });
      break;
  }
  return enumErrors.length === 0 ? null : enumErrors;
};

const exporterValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  exporterValidation,
  exporterCheckEnums,
  exporterStatus,
};
