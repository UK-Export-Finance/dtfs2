const AMENDMENT_STATUS = {
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  NOT_STARTED: 'Not started',
};

const AMENDMENT_BANK_DECISION = {
  PROCEED: 'Proceed',
  WITHDRAW: 'Withdrawn',
  NOT_APPLICABLE: 'Not applicable',
  AWAITING_DECISION: 'Awaiting decision',
};

const BANK_DECISIONS_TAGS = {
  [AMENDMENT_BANK_DECISION.PROCEED]: 'govuk-tag--green',
  [AMENDMENT_BANK_DECISION.WITHDRAW]: 'govuk-tag--red',
  [AMENDMENT_BANK_DECISION.NOT_APPLICABLE]: 'govuk-tag--red',
  [AMENDMENT_BANK_DECISION.AWAITING_DECISION]: 'govuk-tag--yellow',
};

const SUBMISSION_TYPE = {
  MANUAL_AMENDMENT: 'Manual Amendment',
  AUTOMATIC_AMENDMENT: 'Automatic Amendment',
};

module.exports = {
  AMENDMENT_STATUS,
  AMENDMENT_BANK_DECISION,
  BANK_DECISIONS_TAGS,
  SUBMISSION_TYPE,
};
