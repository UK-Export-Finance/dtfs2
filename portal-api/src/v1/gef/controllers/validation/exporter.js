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
  if (doc.industrySector === null) {
    required.push('industrySector');
  }
  if (doc.industryClass === null) {
    required.push('industryClass');
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

const exporterCheckEnums = (doc) => {
  const enumErrors = [];
  switch (doc.smeType) {
    case 'MICRO':
    case 'SMALL':
    case 'MEDIUM':
    case 'NOT_SME':
    case null:
    case undefined:
      break;
    default:
      enumErrors.push('smeType');
      break;
  }
  return enumErrors.length === 0 ? null : enumErrors;
};

const exporterValidation = (doc) => ({
  required: hasRequiredItems(doc)
});

module.exports = {
  exporterValidation,
  exporterCheckEnums,
  exporterStatus,
};
