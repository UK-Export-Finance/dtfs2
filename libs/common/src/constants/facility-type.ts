export const GEF_FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
} as const;

export const BSS_EWCS_FACILITY_TYPE = {
  BOND: 'Bond',
  LOAN: 'Loan',
} as const;

export const BOND_FACILITY_TYPE = {
  ADVANCE_PAYMENT_GUARANTEE: 'Advance payment guarantee',
  BID_BOND: 'Bid bond',
  MAINTENANCE_BOND: 'Maintenance bond',
  PERFORMANCE_BOND: 'Performance bond',
  PROGRESS_PAYMENT_BOND: 'Progress payment bond',
  RETENTION_BOND: 'Retention bond',
  STANDBY_LETTER_OF_CREDIT: 'Standby letter of credit',
  WARRANTY_LETTER: 'Warranty letter',
} as const;

export const FACILITY_TYPE = { ...GEF_FACILITY_TYPE, ...BSS_EWCS_FACILITY_TYPE } as const;
