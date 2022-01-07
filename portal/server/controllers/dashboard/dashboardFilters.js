const {
  PRODUCT,
  SUBMISSION_TYPE,  
  STATUS,
} = require('../../constants');

const generateFilterObject = (name) => ({
  value: name,
  text: name,
  checked: false,
});

const dashboardFilters = () => ({
  product: [
    generateFilterObject(PRODUCT.BSS_EWCS),
    generateFilterObject(PRODUCT.GEF),
  ],
  submissionType: [
    generateFilterObject(SUBMISSION_TYPE.automaticInclusionNotice),
    generateFilterObject(SUBMISSION_TYPE.manualInclusionApplication),
    generateFilterObject(SUBMISSION_TYPE.manualInclusionNotice),
  ],
  status: [
    generateFilterObject('All statuses'),
    generateFilterObject(STATUS.draft),
    generateFilterObject(STATUS.readyForApproval),
    generateFilterObject(STATUS.inputRequired),
    generateFilterObject(STATUS.submitted),
    generateFilterObject(STATUS.submissionAcknowledged),
    generateFilterObject(STATUS.inProgress),
    generateFilterObject(STATUS.approvedWithConditions),
    generateFilterObject(STATUS.approved),
    generateFilterObject(STATUS.refused),
    generateFilterObject(STATUS.abandoned),
  ],
});

module.exports = {
  generateFilterObject,
  dashboardFilters,
};
