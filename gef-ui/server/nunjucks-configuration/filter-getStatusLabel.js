const statusLabelMap = {
  DRAFT: 'Draft',
  BANK_CHECK: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const getStatusLabel = (status) => statusLabelMap[status] || status;

module.exports = getStatusLabel;
