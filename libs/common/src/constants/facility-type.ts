export const GEF_FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
} as const;

export const BSS_EWCS_FACILITY_TYPE = {
  BOND: 'Bond',
  LOAN: 'Loan',
} as const;

export const FACILITY_TYPE = { ...GEF_FACILITY_TYPE, ...BSS_EWCS_FACILITY_TYPE } as const;
