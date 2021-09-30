const { STATUS } = require('../../enums');

/* eslint-disable consistent-return */
const hasRequiredItems = (doc) => {
  const required = [];

  if (!doc?.manualInclusion?.length) {
    required.push('manualInclusion');
  }

  if (!doc?.securityDetails?.exporter || !doc?.securityDetails?.application) {
    required.push('securityDetails');
  }

  return required;
};

const supportingInfoStatus = (doc) => {
  const requiredCount = hasRequiredItems(doc).length;
  if (requiredCount === 2) {
    return STATUS.NOT_STARTED;
  }
  if (requiredCount > 0) {
    return STATUS.IN_PROGRESS;
  }
  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }
};

module.exports = {
  supportingInfoStatus,
};
