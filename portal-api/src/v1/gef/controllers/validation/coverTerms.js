const { STATUS } = require('../../enums');

/* eslint-disable consistent-return */
const hasRequiredItems = (doc) => {
  const required = [];

  if (doc.coverStart === null) {
    required.push('coverStart');
  }
  if (doc.noticeDate === null) {
    required.push('noticeDate');
  }
  if (doc.facilityLimit === null) {
    required.push('facilityLimit');
  }
  if (doc.exporterDeclaration === null) {
    required.push('exporterDeclaration');
  }
  if (doc.dueDiligence === null) {
    required.push('dueDiligence');
  }
  if (doc.facilityLetter === null) {
    required.push('facilityLetter');
  }
  if (doc.facilityBaseCurrency === null) {
    required.push('facilityBaseCurrency');
  }
  if (doc.facilityPaymentCurrency === null) {
    required.push('facilityPaymentCurrency');
  }
  return required;
};

const isAutomaticCover = (doc) => {
  const properties = ['coverStart', 'noticeDate', 'facilityLimit', 'exporterDeclaration', 'dueDiligence',
    'facilityLetter', 'facilityBaseCurrency', 'facilityPaymentCurrency'];

  if (properties.every((key) => doc[key] === 'true')) {
    return true;
  }
  if (properties.some((key) => doc[key] === null)) {
    return null;
  }
  return false;
};

const coverTermsStatus = (doc) => {
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

const coverTermsValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  coverTermsValidation,
  coverTermsStatus,
  isAutomaticCover,
};
