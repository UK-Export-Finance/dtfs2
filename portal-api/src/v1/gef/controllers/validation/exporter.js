/* eslint-disable consistent-return */

const CONSTANTS = require('../../../../constants');

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

const exporterValidation = (doc) => ({
  required: unansweredFields(doc),
});

module.exports = {
  unansweredFields,
  exporterStatus,
  exporterValidation,
};
