export const INITIATE_RECORD_CORRECTION_ERROR_KEY = {
  NO_FEE_RECORDS_SELECTED: 'no-fee-records-selected',
  MULTIPLE_FEE_RECORDS_SELECTED: 'multiple-fee-records-selected',
  INVALID_STATUS: 'invalid-status',
} as const;

export const GENERATE_KEYING_DATA_ERROR_KEY = {
  NO_MATCHING_FEE_RECORDS: 'no-matching-fee-records',
} as const;

export const ADD_PAYMENT_ERROR_KEY = {
  NO_FEE_RECORDS_SELECTED: 'no-fee-records-selected',
  DIFFERENT_STATUSES: 'different-statuses',
  DIFFERENT_PAYMENT_CURRENCIES: 'different-payment-currencies',
  MULTIPLE_DOES_NOT_MATCH_SELECTED: 'multiple-does-not-match-selected',
} as const;
