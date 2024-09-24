import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';

export const TFM_URL = 'http://localhost:5003';

export const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

export const SUBMISSION_TYPE = DEAL_SUBMISSION_TYPE;

export const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
  BOND: 'Bond',
  LOAN: 'Loan',
};

export const FACILITY_STAGE = {
  UNISSUED: 'Unissued',
  ISSUED: 'Issued',
  CONDITIONAL: 'Conditional',
  UNCONDITIONAL: 'Unconditional',
};

export const DEAL_STATUS = {
  // these statuses can either be on the top level
  // or in a child object, not specific to the entire deal
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  // statuses specific to the entire deal
  READY_FOR_APPROVAL: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

export const UNDERWRITER_MANAGER_DECISIONS = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
  NOT_ADDED: 'Not added',
  AUTOMATIC_APPROVAL: 'Automatic approval',
  AWAITING_DECISION: 'Awaiting decision',
};

export const FEE_TYPE = {
  ADVANCE: 'In advance',
  ARREAR: 'In arrear',
  MATURITY: 'At maturity',
};

export const FEE_FREQUENCY = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
};

export const BSS_FACILITY_TYPE = {
  ADVANCE_PAYMENT_GUARANTEE: 'Advance payment guarantee',
  BID_BOND: 'Bid bond',
  MAINTENANCE_BOND: 'Maintenance bond',
  PERFORMANCE_BOND: 'Performance bond',
  PROGRESS_PAYMENT_BOND: 'Progress payment bond',
  RETENTION_BOND: 'Retention bond',
  STANDBY_LETTER_OF_CREDIT: 'Standby letter of credit',
  WARRANTY_LETTER: 'Warranty letter',
};

export const DAY_COUNT_BASIS = {
  360: '360',
  365: '365',
};

export const CURRENCY = {
  AED: 'AED',
  AED_TEXT: 'AED - U.A.E. Dirham',
  GBP: 'GBP',
};

export const PORTAL_USER_ROLES = {
  ADMIN: 'admin',
  MAKER: 'maker',
  CHECKER: 'checker',
  READ_ONLY: 'read-only',
  PAYMENT_REPORT_OFFICER: 'payment-report-officer',
};

export const PDC_TEAMS = {
  PDC_READ: 'PDC_READ',
  PDC_RECONCILE: 'PDC_RECONCILE',
};

export const TFM_USER_TEAMS = {
  ...PDC_TEAMS,
  UNDERWRITERS: 'UNDERWRITERS',
  UNDERWRITER_MANAGERS: 'UNDERWRITER_MANAGERS',
  BUSINESS_SUPPORT: 'BUSINESS_SUPPORT',
  TEAM1: 'TEAM1',
  RISK_MANAGERS: 'RISK_MANAGERS',
  UNDERWRITING_SUPPORT: 'UNDERWRITING_SUPPORT',
  PIM: 'PIM',
};

export const PORTAL_USER_SIGN_IN_TOKENS = {
  VALID_FORMAT_SIGN_IN_TOKEN_ONE: '1111111111abcdef1111111111abcdef1111111111abcdef1111111111abcdef',
  VALID_FORMAT_SIGN_IN_TOKEN_TWO: '3333333333abcdef3333333333abcdef3333333333abcdef3333333333abcdef',
  VALID_FORMAT_SIGN_IN_TOKEN_THREE: '4444444444abcdef4444444444abcdef4444444444abcdef4444444444abcdef',
  VALID_FORMAT_SIGN_IN_TOKEN_FOUR: '5555555555abcdef5555555555abcdef5555555555abcdef5555555555abcdef',
  INVALID_FORMAT_SIGN_IN_TOKEN: '2222222222abcdef2222222222abcdef',
};

export const NODE_TASKS = {
  GET_ALL_BANKS: 'getAllBanks',
  INSERT_UTILISATION_REPORTS_INTO_DB: 'insertUtilisationReportsIntoDb',
  REMOVE_ALL_UTILISATION_REPORTS_FROM_DB: 'removeAllUtilisationReportsFromDb',
  REMOVE_ALL_PAYMENT_MATCHING_TOLERANCES_FROM_DB: 'removeAllPaymentMatchingTolerancesFromDb',
  INSERT_PAYMENT_MATCHING_TOLERANCES_INTO_DB: 'insertPaymentMatchingTolerancesIntoDb',
  REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES: 'reinsertZeroThresholdPaymentMatchingTolerances',
  INSERT_FEE_RECORDS_INTO_DB: 'insertFeeRecordsIntoDb',
  INSERT_PAYMENTS_INTO_DB: 'insertPaymentsIntoDb',
  REMOVE_ALL_PAYMENTS_FROM_DB: 'removeAllPaymentsFromDb',
  REMOVE_ALL_FEE_RECORDS_FROM_DB: 'removeAllFeeRecordsFromDb',
  DELETE_ALL_FROM_SQL_DB: 'deleteAllFromSqlDb',
  INSERT_TFM_FACILITIES_INTO_DB: 'insertManyTfmFacilities',
  DELETE_ALL_TFM_FACILITIES_FROM_DB: 'deleteAllTfmFacilities',
};
