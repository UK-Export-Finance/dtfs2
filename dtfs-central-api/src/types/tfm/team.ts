export type TeamId =
  | 'UNDERWRITING_SUPPORT'
  | 'UNDERWRITER_MANAGERS'
  | 'UNDERWRITERS'
  | 'RISK_MANAGERS'
  | 'BUSINESS_SUPPORT'
  | 'PIM'
  | 'PDC_READ'
  | 'PDC_RECONCILE';

export type Team = {
  id: TeamId;
  name: string;
  email: string;
};
