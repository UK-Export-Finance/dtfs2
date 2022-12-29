const NON_DELEGATED_BANKS_DEALS = [
  // '0001083473',
  // '0001093373',
  // '0001099435',
  // '0001107782',
  // '0001109203',
  // '0001115476',
  // '0001115944',
  '0020003653',
  // '0020003958',
  // '0020003960',
  // '0020009761',
  // '0020009761',
  // '0020009765',
  // '0020011398',
  // '0020011398',
  // '0020011401',
  // '0020011875',
  // '0020013217',
  // '0020013219',
  // '0020013733',
  // '0020014299',
  // '0020014326',
  // '0020015131',
  // '0020016010',
  // '0020016100',
  // '0020016102',
  // '0020016257',
  // '0020016259',
  // '0020016412',
  // '0020016531'
];

const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const TFM_STATUS = {
  CONFIRMED: 'Confirmed',
  APPLICATION: 'Application',
  IN_PROGRESS_BY_UKEF: 'In progress',
  UKEF_APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
  ABANDONED: 'Abandoned',
};

const PORTAL_STATUS = {
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const LOSS_GIVEN_DEFAULT = {
  DEFAULT: 50,
};

const PROBABILITY_OF_DEFAULT = {
  DEFAULT_VALUE: 14.1,
};

const CREDIT_RATING = {
  'BB-': 'Good (BB-)',
  'B+': 'Acceptable (B+)',
};

const UNDERWRITER_MANAGER_DECISIONS = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
  NOT_ADDED: 'Not added',
  AUTOMATIC_APPROVAL: 'Automatic approval',
  AWAITING_DECISION: 'Awaiting decision',
};

module.exports = {
  DEAL_TYPE,
  SUBMISSION_TYPE,
  TFM_STATUS,
  PORTAL_STATUS,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
  CREDIT_RATING,
  UNDERWRITER_MANAGER_DECISIONS,
  NON_DELEGATED_BANKS_DEALS,
};
