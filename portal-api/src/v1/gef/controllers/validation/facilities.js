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
  if (!doc.startOnDayOfNotice) {
    required.push('startOnDayOfNotice');
  }
  if (!doc.coverStartDate) {
    required.push('coverStartDate');
  }
  if (!doc.coverEndDate) {
    required.push('coverEndDate');
  }
  if (!doc.monthsOfCover) {
    required.push('monthsOfCover');
  }
  if (!doc.details) {
    required.push('details');
  }
  if (!doc.detailsOther) {
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
  if (!doc.paymentType) {
    required.push('paymentType');
  }
  return required;
};

const facilitiesStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;
  if (!doc.updatedAt) {
    return 0; // Not Started
  }
  if (requiredCount > 0) {
    return 1; // In Progress
  }
  if (requiredCount === 0) {
    return 2; // Completed
  }
};

const facilitiesValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  facilitiesValidation,
  facilitiesStatus,
};
