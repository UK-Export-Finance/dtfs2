import { Team, TeamId } from '../types/tfm/teams';

export const TFM_TEAMS: Record<TeamId, Team> = {
  UNDERWRITER_SUPPORT: {
    id: 'UNDERWRITER_SUPPORT',
    name: 'Underwriter support',
    email: 'test@email.com',
  },
  UNDERWRITER_MANAGERS: {
    id: 'UNDERWRITER_MANAGERS',
    name: 'Underwriter managers',
    email: 'test@email.com',
  },
  UNDERWRITERS: {
    id: 'UNDERWRITERS',
    name: 'Underwriters',
    email: 'test@email.com',
  },
  RISK_MANAGERS: {
    id: 'RISK_MANAGERS',
    name: 'Risk managers',
    email: 'test@email.com',
  },
  BUSINESS_SUPPORT: {
    id: 'BUSINESS_SUPPORT',
    name: 'Business support',
    email: 'test@email.com',
  },
  PIM: {
    id: 'PIM',
    name: 'Post issue management',
    email: 'test@email.com',
  },
  PDC_READ: {
    id: 'PDC_READ',
    name: 'PDC read',
    email: 'test@email.com',
  },
  PDC_RECONCILE: {
    id: 'PDC_RECONCILE',
    name: 'PDC reconcile',
    email: 'test@email.com',
  },
};
