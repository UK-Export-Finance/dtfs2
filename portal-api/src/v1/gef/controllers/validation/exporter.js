/* eslint-disable consistent-return */

const CONSTANTS = require('../../../../constants');
const { SME_TYPE } = require('../../enums');

const TOTAL_REQUIRED = 8;

const unansweredFields = (answers) => {
  const required = [];

  if (!answers.companiesHouseRegistrationNumber) {
    required.push('companiesHouseRegistrationNumber');
  }
  if (!answers.companyName) {
    required.push('companyName');
  }
  if (!answers.registeredAddress) {
    required.push('registeredAddress');
  }
  if (!answers.selectedIndustry) {
    required.push('selectedIndustry');
  }
  if (!answers.industries) {
    required.push('industries');
  }
  if (!answers.smeType) {
    required.push('smeType');
  }
  if (!answers.probabilityOfDefault) {
    required.push('probabilityOfDefault');
  }
  if (answers.isFinanceIncreasing !== false && !answers.isFinanceIncreasing) {
    required.push('isFinanceIncreasing');
  }

  return required;
};

const exporterStatus = (answers) => {
  const requiredCount = unansweredFields(answers).length;

  if (requiredCount === TOTAL_REQUIRED) {
    return CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
  }

  if (requiredCount > 0) {
    return CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
  }

  if (requiredCount === 0) {
    return CONSTANTS.DEAL.DEAL_STATUS.COMPLETED;
  }

  return CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
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
  required: unansweredFields(doc),
});

module.exports = {
  unansweredFields,
  exporterStatus,
  exporterCheckEnums,
  exporterValidation,
};
