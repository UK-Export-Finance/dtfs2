import { Prettify } from '../../types/types-helper';
import { TeamId, Team } from '../../types/tfm';

type TeamRecord = {
  readonly [Id in TeamId]: Readonly<Team & { id: Id }>;
};

export const TEAMS: Prettify<TeamRecord> = {
  UNDERWRITING_SUPPORT: {
    id: 'UNDERWRITING_SUPPORT',
    name: 'Underwriting support',
    email: 'maker1@ukexportfinance.gov.uk',
  },
  BUSINESS_SUPPORT: {
    id: 'BUSINESS_SUPPORT',
    name: 'Business support group',
    email: 'maker1@ukexportfinance.gov.uk',
  },
  UNDERWRITER_MANAGERS: {
    id: 'UNDERWRITER_MANAGERS',
    name: 'Underwriter managers',
    email: 'checker1@ukexportfinance.gov.uk',
  },
  UNDERWRITERS: {
    id: 'UNDERWRITERS',
    name: 'Underwriters',
    email: 'checker1@ukexportfinance.gov.uk',
  },
  RISK_MANAGERS: {
    id: 'RISK_MANAGERS',
    name: 'Risk managers',
    email: 'checker1@ukexportfinance.gov.uk',
  },
  PIM: {
    id: 'PIM',
    name: 'PIM',
    email: 'checker2@ukexportfinance.gov.uk',
  },
  PDC_READ: {
    id: 'PDC_READ',
    name: 'PDC read',
    email: 'payment-officer2@ukexportfinance.gov.uk',
  },
  PDC_RECONCILE: {
    id: 'PDC_RECONCILE',
    name: 'PDC reconcile',
    email: 'payment-officer3@ukexportfinance.gov.uk',
  },
} as const;
