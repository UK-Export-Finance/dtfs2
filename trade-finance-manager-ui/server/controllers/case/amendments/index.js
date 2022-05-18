const { getAmendmentRequestDate, postAmendmentRequestDate } = require('./amendmentRequestDate.controller');
const { getAmendmentRequestApproval, postAmendmentRequestApproval } = require('./amendmentRequestApproval.controller');
const { getAmendmentOptions, postAmendmentOptions } = require('./amendmentOptions.controller');
const { getAmendmentEffectiveDate, postAmendmentEffectiveDate } = require('./amendmentEffectiveDate.controller');
const { getAmendFacilityValue, postAmendFacilityValue } = require('./amendFacilityValue.controller');
const { getAmendCoverEndDate, postAmendCoverEndDate } = require('./amendCoverEndDate.controller');
const { getAmendmentAnswers, postAmendmentAnswers } = require('./amendmentAnswers.controller');

module.exports = {
  getAmendmentRequestDate,
  postAmendmentRequestDate,
  getAmendmentRequestApproval,
  postAmendmentRequestApproval,
  getAmendmentOptions,
  postAmendmentOptions,
  getAmendmentEffectiveDate,
  postAmendmentEffectiveDate,
  getAmendFacilityValue,
  postAmendFacilityValue,
  getAmendCoverEndDate,
  postAmendCoverEndDate,
  getAmendmentAnswers,
  postAmendmentAnswers,
};
