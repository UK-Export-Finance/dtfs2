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
  if (!doc.industrySectorId) {
    required.push('industrySectorId');
  }
  if (!doc.industryClassId) {
    required.push('industryClassId');
  }
  if (!doc.smeTypeId) {
    required.push('smeTypeId');
  }
  if (!doc.probabilityOfDefault) {
    required.push('probabilityOfDefault');
  }
  if (!doc.isFinanceIncreasing) {
    required.push('isFinanceIncreasing');
  }
  return required;
};

const exporterValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  exporterValidation,
};
