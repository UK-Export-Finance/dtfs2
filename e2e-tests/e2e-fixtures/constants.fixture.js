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
  VALID_FORMAT_SIGN_IN_TOKEN_ONE:
    'f9b2cba142d5e6f228520edafc9c62c89402119cc9e429eec38c1973773c5ba90ec63d7b7e6766dfdff074f032ca79ba0e07054b40d17486936e86196fdd309a0d091ff2d2f741e6f9dc28a334171743f7993fd34a309c616274f88bf8274d34c5324db0ebfd6980a4b3fd6dc03780a6d6466bdc71dbc012e21132005940b9cd',
  VALID_FORMAT_SIGN_IN_TOKEN_TWO:
    '03bfb8faf64fef5f33acdbc8117f7162ed4720c5af41a13e2022c6fca0bec379e26984a8eeed5d063638cc4254291a4ab66a75c09316fefd77cb4dbd4b116e045c7f4dfb32f74089c7dc745b0ddea2de6baaf318abb02a24c14453b32f6616681568c87bccc0f339c29a1255ede33d5eadab49457abe4bf10a9227f45e08d952',
  VALID_FORMAT_SIGN_IN_TOKEN_THREE:
    'ed04f9d3e39ef38f9d309d5794bfbfe14b22200ca478088428393217540061032ca678124b45836cd1a9391c984f03b95f682d6cdb5b9d02f0e491e1b80fea8db3e7699f0edcd9202864165902808d8e218794d6628356f3236a3908361499638a63c1038a9d8a59abf75311ff8833ca7e5eba72c159c911edbd8b732b8efe07',
  VALID_FORMAT_SIGN_IN_TOKEN_FOUR:
    '0346ed444c18d0e9cf148864e76256486702fe8ef942598af86828762a11323f9cd481a971efb814703bf44815d8c2b7c84e64f77ca8920e0e6c67b43810713d6044d094da65e1bc992cb0855370c0468ce06a44978c27a25ff6e2125f8585c0effd0a501993d5fa4f97ac89cc9ebd82c4ff55b115b9fc59ca2efa819d16ca41',

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
  INSERT_FEE_RECORD_CORRECTIONS_INTO_DB: 'insertFeeRecordCorrectionsIntoDb',
  GET_FEE_RECORD_FROM_DB_BY_ID: 'getFeeRecordById',
  INSERT_PAYMENTS_INTO_DB: 'insertPaymentsIntoDb',
  REMOVE_ALL_PAYMENTS_FROM_DB: 'removeAllPaymentsFromDb',
  REMOVE_ALL_FEE_RECORDS_FROM_DB: 'removeAllFeeRecordsFromDb',
  DELETE_ALL_FROM_SQL_DB: 'deleteAllFromSqlDb',
  INSERT_TFM_FACILITIES_INTO_DB: 'insertManyTfmFacilities',
  DELETE_ALL_TFM_FACILITIES_FROM_DB: 'deleteAllTfmFacilities',
  REMOVE_ALL_FEE_RECORD_CORRECTION_REQUEST_TRANSIENT_FORM_DATA_FROM_DB: 'removeAllFeeRecordCorrectionRequestTransientFormDataFromDb',
  REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB: 'removeAllFeeRecordCorrectionTransientFormDataFromDb',
};
