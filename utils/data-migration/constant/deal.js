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
  GOOD: 'Good (BB-)',
  ACCEPTABLE: 'Acceptable (B+)',
};

module.exports = {
  DEAL_TYPE,
  SUBMISSION_TYPE,
  TFM_STATUS,
  PORTAL_STATUS,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
  CREDIT_RATING,
};
