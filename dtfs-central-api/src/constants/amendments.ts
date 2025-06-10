export const AMENDMENT_BANK_DECISION = {
  PROCEED: 'Proceed',
  WITHDRAW: 'Withdrawn',
  NOT_APPLICABLE: 'Not applicable',
  AWAITING_DECISION: 'Awaiting decision',
} as const;

export const AMENDMENT_MANAGER_DECISIONS = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
} as const;
