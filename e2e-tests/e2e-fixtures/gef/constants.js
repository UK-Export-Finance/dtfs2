const {
  PORTAL_USER_ROLES: USER_ROLES,
  PORTAL_USER_SIGN_IN_TOKENS: SIGN_IN_TOKENS,
  DEAL_TYPE,
  SUBMISSION_TYPE: DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
} = require('../constants.fixture');

const DEAL_COMMENT_TYPE_PORTAL = {
  UKEF_COMMENT: 'ukefComments',
  UKEF_DECISION: 'ukefDecision',
};

const PORTAL_ACTIVITY_LABEL = {
  MIA_SUBMISSION: 'Manual inclusion application submitted to UKEF',
  MIN_SUBMISSION: 'Manual inclusion notice submitted to UKEF',
  AIN_SUBMISSION: 'Automatic inclusion notice submitted to UKEF',
  FACILITY_CHANGED_ISSUED: 'Bank facility stage changed',
};

const POSTCODE = {
  VALID: 'E1 6JE',
  INVALID: 'ABC',
};

module.exports = {
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_COMMENT_TYPE_PORTAL,
  PORTAL_ACTIVITY_LABEL,
  POSTCODE,
  USER_ROLES,
  SIGN_IN_TOKENS,
};
