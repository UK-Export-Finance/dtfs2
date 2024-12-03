import { PdcTeamId, TeamId } from '../../types';

export const ALL_PDC_TEAM_IDS = ['PDC_READ', 'PDC_RECONCILE'] as const;

export const ALL_TEAM_IDS = [
  'UNDERWRITING_SUPPORT',
  'UNDERWRITER_MANAGERS',
  'UNDERWRITERS',
  'RISK_MANAGERS',
  'BUSINESS_SUPPORT',
  'PIM',
  ...ALL_PDC_TEAM_IDS,
] as const;

export const PDC_TEAM_IDS = {
  PDC_READ: 'PDC_READ',
  PDC_RECONCILE: 'PDC_RECONCILE',
} as const satisfies Record<PdcTeamId, PdcTeamId>;

export const TEAM_IDS = {
  UNDERWRITING_SUPPORT: 'UNDERWRITING_SUPPORT',
  UNDERWRITER_MANAGERS: 'UNDERWRITER_MANAGERS',
  UNDERWRITERS: 'UNDERWRITERS',
  RISK_MANAGERS: 'RISK_MANAGERS',
  BUSINESS_SUPPORT: 'BUSINESS_SUPPORT',
  PIM: 'PIM',
  ...PDC_TEAM_IDS,
} as const satisfies Record<TeamId, TeamId>;
