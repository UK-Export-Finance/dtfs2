/**
 * TFM credit ratings that do not directly match APIM MDM credit risk ratings, and their mapped APIM MDM credit risk rating value.
 * This is required to map TFM's exporter credit rating to the expected APIM MDM credit risk rating value for the facility credit rating to be sent to GIFT.
 */
export const TFM_CREDIT_RATING_MAP = {
  'Good (BB-)': 'BB-',
  'Acceptable (B+)': 'B+',
};

export const EXPORTER_CREDIT_RATING_FULL = {
  B_PLUS: 'Acceptable (B+)',
  BB_MINUS: 'Good (BB-)',
};

export const EXPORTER_CREDIT_RATING_SHORT = {
  B_PLUS: 'B+',
  BB_MINUS: 'BB-',
};
