/* eslint-disable consistent-return */
const hasRequiredItems = (doc) => {
  const required = [];
  if (doc.type === null) {
    required.push('type');
  }
  if (doc.hasBeenIssued === null) {
    required.push('hasBeenIssued');
  }
  if (doc.name === null) {
    required.push('name');
  }
  if (doc.startOnDayOfNotice === null) {
    required.push('startOnDayOfNotice');
  }
  if (doc.coverStartDate === null) {
    required.push('coverStartDate');
  }
  if (doc.coverEndDate === null) {
    required.push('coverEndDate');
  }
  if (doc.monthsOfCover === null) {
    required.push('monthsOfCover');
  }
  if (doc.details === null) {
    required.push('details');
  }
  if (doc.details && doc.details.length > 0 && doc.details.includes('other') && doc.detailsOther === null) {
    required.push('detailsOther');
  }
  if (doc.currency === null) {
    required.push('currency');
  }
  if (doc.value === null) {
    required.push('value');
  }
  if (doc.coverPercentage === null) {
    required.push('coverPercentage');
  }
  if (doc.interestPercentage === null) {
    required.push('interestPercentage');
  }
  if (doc.paymentType === null) {
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

const facilitiesOverallStatus = (facilities) => {
  let result = 0;
  const allStatus = [];
  facilities.forEach((item) => {
    allStatus.push(item.status);
  });
  const uniqueStatus = [...new Set(allStatus)];
  // console.log(uniqueStatus, uniqueStatus && uniqueStatus.length === 1 && uniqueStatus[0] === 2);
  if (uniqueStatus.length > 1) {
    result = 1;
  }
  if (uniqueStatus && uniqueStatus.length === 1 && uniqueStatus[0] === 2) {
    result = 2;
  }
  return result;
};

const facilitiesValidation = (doc) => ({
  required: hasRequiredItems(doc),
});

module.exports = {
  facilitiesValidation,
  facilitiesOverallStatus,
  facilitiesStatus,
};
