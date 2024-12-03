export const REGEX = {
  PARTY_URN: /^\d{8}$/,
  INT: /^-?\d+$/,
  YEAR: /^\d{4}$/,
  BANK_ID: /^\d+$/,
  PARTIAL_FACILITY_ID: /^\d{4,10}$/,
} as const;
