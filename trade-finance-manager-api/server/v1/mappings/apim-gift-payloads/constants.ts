/**
 * APIM/GIFT product type codes.
 * An "Unknown" code is included to use as a fallback value when the deal type is not recognized, to avoid sending null values to APIM/GIFT which would cause errors.
 * Note that this is an extreme edge case that will probably never occur in practice, as the deal type is expected to always be recognized for valid deals.
 * This is included as a safeguard to ensure that the integration can handle unexpected deal types without breaking.
 * If the "Unknown" product type code is sent to APIM/GIFT, this will trigger an alert in APIM for the unexpected product type code value, which can be investigated by the team.
 */
export const PRODUCT_TYPE_CODES = {
  BSS: 'BSS',
  GEF: 'GEF',
  UNKNOWN: 'UNKNOWN_PRODUCT_TYPE_CODE',
} as const;

/**
 * TFM credit ratings that do not directly match APIM MDM credit risk ratings, and their mapped APIM MDM credit risk rating value.
 * This is required to map TFM's exporter credit rating to the expected APIM MDM credit risk rating value for the facility credit rating to be sent to GIFT.
 */
export const TFM_CREDIT_RATING_MAP = {
  'Good (BB-)': 'BB-',
  'Acceptable (B+)': 'B+',
};

/**
 * Obligation amount calculations for GEF facilities, based on the APIM GIFT documentation:
 * - For Cash GEF facilities, the obligation amount is calculated as 85% of the Max UKEF exposure.
 * - For Contingent GEF facilities, the obligation amount is calculated as 70% of the Max UKEF exposure.
 * For non-GEF facilities, the obligation amount is simply the Max UKEF exposure.
 * These calculations are required to map the facility's UKEF exposure to the expected obligation amount in APIM/GIFT when mapping the facility "obligations" data for the APIM GIFT payload.
 */
export const OBLIGATION_AMOUNT = {
  UKEF_EXPOSURE_PERCENTAGE: {
    CASH: 0.85,
    CONTINGENT: 0.7,
  },
} as const;

/**
 * APIM/GIFT obligation subtype codes.
 * These are ultimately stored and controlled by ODS.
 */
export const OBLIGATION_SUBTYPE_CODES = {
  ADVANCED_PAYMENT_GUARANTEE: 'OST012',
  BID_BOND: 'TODO: pending GIFT work',
  MAINTENANCE_BOND: 'TODO: pending GIFT work',
  PERFORMANCE_BOND: 'OST013',
  PROGRESS_PAYMENT_BOND: 'OST015',
  RETENTION_BOND: 'OST018',
  STANDBY_LETTER_OF_CREDIT: 'TODO: pending GIFT work',
  WARRANTY_LETTER: 'OST016',
};

/**
 * Obligation subtype codes for APIM GIFT, mapped by facility subtype name and deal type (e.g. BSS).
 * This is required to map the facility subtype name from TFM to the expected obligation subtype code in APIM/GIFT when mapping the facility "obligations" data for the APIM GIFT payload.
 * The obligation subtype code is required by APIM/GIFT to identify the type of obligation for each facility.
 * The obligation subtype code values are based on the APIM/GIFT documentation and may require updates if new obligation subtypes are added in APIM/GIFT or if existing ones are modified.
 *
 * Examples:
 * BSS "Advance payment guarantee" => "OST012" ("BSS Advance Payment Guarantee")
 * BSS "Progress payment bond" => "OST015" ("BSS Progress Payment Bond")
 */
export const OBLIGATION_SUBTYPE_MAP = {
  BSS: {
    'Advance payment guarantee': OBLIGATION_SUBTYPE_CODES.ADVANCED_PAYMENT_GUARANTEE,
    'Bid bond': OBLIGATION_SUBTYPE_CODES.BID_BOND,
    'Maintenance bond': OBLIGATION_SUBTYPE_CODES.MAINTENANCE_BOND,
    'Performance bond': OBLIGATION_SUBTYPE_CODES.PERFORMANCE_BOND,
    'Progress payment bond': OBLIGATION_SUBTYPE_CODES.PROGRESS_PAYMENT_BOND,
    'Retention bond': OBLIGATION_SUBTYPE_CODES.RETENTION_BOND,
    'Standby letter of credit': OBLIGATION_SUBTYPE_CODES.STANDBY_LETTER_OF_CREDIT,
    'Warranty letter': OBLIGATION_SUBTYPE_CODES.WARRANTY_LETTER,
  },
} as const;

/**
 * Consumer name for APIM TFS - GIFT facility integration.
 * This is required to indicate which service/consumer is sending data to APIM/GIFT.
 */
const CONSUMER = 'DTFS' as const;

/**
 * BSS = default credit type to "Term".
 * GEF = default credit type to "Revolving".
 * UNKNOWN_PRODUCT_TYPE_CODE = default credit type to "Unknown", which is a fallback value for unrecognized deal types.
 */
const CREDIT_TYPE = {
  BSS: 'Term',
  GEF: 'Revolving',
  UNKNOWN_PRODUCT_TYPE_CODE: 'UNKNOWN_CREDIT_TYPE',
} as const;

/**
 * BSS = facility is not revolving.
 * GEF = facility is revolving.
 * UNKNOWN_PRODUCT_TYPE_CODE = facility is not revolving, as a fallback value for unrecognized deal types.
 */
const IS_REVOLVING = {
  BSS: false,
  GEF: true,
  UNKNOWN_PRODUCT_TYPE_CODE: false,
} as const;

/**
 * Counterparty role codes
 * BOND_BENEFICIARY is only sent to APIM/GIFT if a relevant party URN is available.
 */
export const COUNTERPARTY_ROLE_CODE = {
  BOND_BENEFICIARY: 'Bond beneficiary',
  BOND_GIVER: 'Bond giver',
} as const;

/**
 * For BSS/GEF/EWCS,
 * default account to "2" (Corporate) for the "account" field in GIFT.
 */
const GIFT_ACCOUNT = 2 as const;

/**
 * For all facilities,
 * Default the "repayment profile" name, as this is a required field in APIM/GIFT.
 */
const REPAYMENT_PROFILE_NAME = 'Repayment profile' as const;

/**
 * GIFT repayment types.
 * Only "Bullet" is relevant for BSS/EWCS/GEF.
 */
export const REPAYMENT_TYPE = {
  BULLET: 'Bullet',
} as const;

/**
 * For BSS/GEF/EWCS,
 * default risk status to "Corporate" for the "riskStatus" field in GIFT.
 */
const RISK_STATUS = 'Corporate' as const;

export const APIM_GIFT_INTEGRATION = {
  CONSUMER,
  DEFAULTS: {
    COUNTERPARTY_ROLE_CODE: {
      BSS: {
        BOND_BENEFICIARY: COUNTERPARTY_ROLE_CODE.BOND_BENEFICIARY,
        BOND_GIVER: COUNTERPARTY_ROLE_CODE.BOND_GIVER,
      },
    },
    OVERVIEW: {
      CREDIT_TYPE,
      IS_REVOLVING,
    },
    REPAYMENT_PROFILE: {
      NAME: REPAYMENT_PROFILE_NAME,
    },
    REPAYMENT_TYPE,
    RISK_DETAILS: {
      ACCOUNT: GIFT_ACCOUNT,
      RISK_STATUS,
    },
  },
  OBLIGATION_SUBTYPE_MAP,
};
