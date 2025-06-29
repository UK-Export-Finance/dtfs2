/**
 * Amendment data migration helper
 */
const CONSTANTS = require('../constant');

/**
 * Map's workflow amendment status to TFM compliant status
 * @param {String} status Workflow amendment status
 * @return {String} TFM Status
 */
const mapWorkflowStatus = (status) => {
  if (status) {
    switch (status) {
      case 'COMPLETE':
        return CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED;
      case 'IN PROGRESS':
        return CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS;
      case 'CANCELLED':
        // `Cancelled` status does not exist in TFM
        return CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED;
      default:
        return CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED;
    }
  }
  return status;
};

module.exports = mapWorkflowStatus;
