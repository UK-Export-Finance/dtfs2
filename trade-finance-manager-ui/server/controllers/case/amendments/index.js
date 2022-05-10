const { getAmendmentRequestDate, postAmendmentRequestDate } = require('./amendmentRequestDate.controller');
const { getAmendmentRequestApproval, postAmendmentRequestApproval } = require('./amendmentRequestApproval.controller');
const { getAmendmentOptions, postAmendmentOptions } = require('./amendmentOptions.controller');
const { getAmendmentEffectiveDate, postAmendmentEffectiveDate } = require('./amendmentEffectiveDate.controller');

module.exports = {
  getAmendmentRequestDate,
  postAmendmentRequestDate,
  getAmendmentRequestApproval,
  postAmendmentRequestApproval,
  getAmendmentOptions,
  postAmendmentOptions,
  getAmendmentEffectiveDate,
  postAmendmentEffectiveDate,
};
