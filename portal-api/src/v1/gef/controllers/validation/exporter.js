/* eslint-disable consistent-return */
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
  if (doc.industrySectorId === null) {
    required.push('industrySectorId');
  }
  if (doc.industryClassId === null) {
    required.push('industryClassId');
  }
  if (doc.smeTypeId === null) {
    required.push('smeTypeId');
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
  if (!doc.updatedAt) {
    return 'NOT_STARTED';
  }
  if (requiredCount > 0) {
    return 'IN_PROGRESS';
  }
  if (requiredCount === 0) {
    return 'COMPLETED';
  }
};

const exporterValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  exporterValidation,
  exporterStatus,
};
