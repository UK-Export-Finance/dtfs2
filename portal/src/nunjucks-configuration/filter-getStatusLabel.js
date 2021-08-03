const statusLabelMap = {
  DRAFT: 'Draft',
  BANK_CHECK: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned Deal',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_ACCEPTED_CONDITIONAL: 'Accepted by UKEF (with conditions)',
  UKEF_ACCEPTED_UNCONDITIONAL: 'Accepted by UKEF (without conditions)',
  UKEF_DECLINED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};


const getStatusLabel = (status) => statusLabelMap[status] || status;

export default getStatusLabel;
