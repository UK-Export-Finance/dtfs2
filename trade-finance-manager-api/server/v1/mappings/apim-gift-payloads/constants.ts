export const PRODUCT_TYPES = {
  BSS: 'BSS',
  GEF: 'GEF',
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
 */
const CREDIT_TYPE = {
  BSS: 'Term',
  GEF: 'Revolving',
} as const;

/**
 * BSS = facility is not revolving.
 * GEF = facility is revolving.
 */
const IS_REVOLVING = {
  BSS: false,
  GEF: true,
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
    RISK_DETAILS: {
      ACCOUNT: GIFT_ACCOUNT,
      RISK_STATUS,
    },
  },
  OBLIGATION_SUBTYPE_MAP,
};
