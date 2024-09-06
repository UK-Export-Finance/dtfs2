const { DEAL_TYPE, DEAL_STATUS, SUBMISSION_TYPE: DEAL_SUBMISSION_TYPE, FACILITY_TYPE } = require('../../../e2e-fixtures/constants.fixture');

const TASKS = {
  UNASSIGNED: 'Unassigned',
};

const DEAL_STAGE_TFM = {
  CONFIRMED: 'Confirmed',
  APPLICATION: 'Application',
  IN_PROGRESS_BY_UKEF: 'In progress',
  UKEF_APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
  ABANDONED: 'Abandoned',
  AMENDMENT_IN_PROGRESS: 'Amendment in progress',
};

const NOT_ADDED = {
  DASH: '-',
};

const PARTIES = {
  EXPORTER: 'exporter',
  BUYER: 'buyer',
  AGENT: 'agent',
  INDEMNIFIER: 'indemnifier',
  BOND_ISSUER: 'bond-issuer',
  BOND_BENEFICIARY: 'bond-beneficiary',
};

const PARTY_URN = {
  INVALID: '1234',
  VALID: '00322651',
  ANOTHER_VALID: '00325250',
};

const DISPLAY_USER_TEAMS = {
  PIM: 'Post issue management',
  UNDERWRITERS: 'Underwriters',
  RISK_MANAGERS: 'Risk managers',
  BUSINESS_SUPPORT: 'Business support group',
  UNDERWRITER_MANAGERS: 'Underwriter managers',
  UNDERWRITING_SUPPORT: 'Underwriting support',
  PDC_RECONCILE: 'PDC reconcile',
  PDC_READ: 'PDC read',
};

const DATE_FORMATS = {
  FULL: 'dd MMMM yyyy', // 01 January 2024
  SHORT: 'dd MMM yyyy', // 01 Jan 2024
  SINGLE_DIGIT_DAY_LONG: 'd MMMM yyyy', // 1 January 2024
};

/**
 * Stores the alias keys which should be used to access
 * the values yielded from custom commands
 * @link https://github.com/UK-Export-Finance/dtfs2/blob/main/e2e-tests/README.md#Aliases
 */
const ALIAS_KEY = {
  SUBMIT_MANY_DEALS: 'submittedDeals',
  SUBMIT_DEAL: 'submittedDeal',
};

module.exports = {
  TASKS,
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_STAGE_TFM,
  DISPLAY_USER_TEAMS,
  NOT_ADDED,
  PARTY_URN,
  PARTIES,
  DATE_FORMATS,
  ALIAS_KEY,
};
