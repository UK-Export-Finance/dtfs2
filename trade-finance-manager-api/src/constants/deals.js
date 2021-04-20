const DEAL_PRODUCT_CODE = {
  BOND: 'BSS',
  LOAN: 'EWCS',
  BOND_AND_LOAN: 'BSS & EWCS',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const DEAL_STATUS_PORTAL = {
  SUBMITTED: 'Submitted',
  SUBMISSION_ACKNOWLEDGED: 'Acknowledged by UKEF',
  IN_PROGRESS: 'In progress by UKEF',
};

const DEAL_STAGE_TFM = {
  CONFIRMED: 'Confirmed',
  APPLICATION: 'Application',
};

const CREDIT_RATING = {
  GOOD: 'Good (BB-)',
  ACCEPTABLE: 'Acceptable (B+)',
};

const LOSS_GIVEN_DEFAULT = {
  '50_PERCENT': '50%',
};

const PROBABILITY_OF_DEFAULT = {
  LESS_THAN_14_PERCENT: 'Less than 14.1%',
};

module.exports = {
  DEAL_PRODUCT_CODE,
  SUBMISSION_TYPE,
  DEAL_STATUS_PORTAL,
  DEAL_STAGE_TFM,
  CREDIT_RATING,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
};
