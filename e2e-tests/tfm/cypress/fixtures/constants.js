const { DEAL_TYPE, DEAL_STATUS, SUBMISSION_TYPE: DEAL_SUBMISSION_TYPE, FACILITY_TYPE } = require('../../../e2e-fixtures/constants.fixture');

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
  VALID: '00307249',
  ANOTHER_VALID: '00307250',
};

const DISPLAY_USER_TEAMS = {
  PIM: 'Post issue management',
  UNDERWRITERS: 'Underwriters',
  RISK_MANAGERS: 'Risk managers',
  BUSINESS_SUPPORT: 'Business support group',
  UNDERWRITER_MANAGERS: 'Underwriter managers',
  UNDERWRITING_SUPPORT: 'Underwriting support',
};

module.exports = {
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_STAGE_TFM,
  DISPLAY_USER_TEAMS,
  NOT_ADDED,
  PARTY_URN,
  PARTIES,
};
