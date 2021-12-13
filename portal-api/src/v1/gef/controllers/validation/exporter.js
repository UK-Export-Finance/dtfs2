/* eslint-disable consistent-return */

const { SME_TYPE, STATUS } = require('../../enums');

const hasRequiredItems = (doc) => {
  const required = [];
  if (doc.companiesHouseRegistrationNumber === null) {
    required.push('companiesHouseRegistrationNumber');
  }
  if (doc.companyName === null) {
    required.push('companyName');
  }
  if (doc.registeredAddress === null) {
    required.push('registeredAddress');
  }
  if (doc.selectedIndustry === null) {
    required.push('selectedIndustry');
  }
  if (doc.industries === null) {
    required.push('industries');
  }
  if (doc.smeType === null) {
    required.push('smeType');
  }
  if (doc.probabilityOfDefault === null) {
    required.push('probabilityOfDefault');
  }
  if (doc.isFinanceIncreasing === null) {
    required.push('isFinanceIncreasing');
  }
  return required;
};

const exporterStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;

  if (requiredCount > 0) {
    return STATUS.IN_PROGRESS;
  }
  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }

  return STATUS.NOT_STARTED;
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
