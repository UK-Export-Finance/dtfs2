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
 * Consumer name for APIM TFS - GIFT facility integration.
 * This is required to indicate which service/consumer is sending data to APIM/GIFT.
 */
const CONSUMER = 'DTFS' as const;

/**
 * BSS = default credit type to "Term".
 * GEF/EWCS = default credit type to "Revolving".
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
};
