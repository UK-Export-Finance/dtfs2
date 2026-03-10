export const PRODUCT_TYPES = {
  BSS: 'BSS',
  GEF: 'GEF',
} as const;

/**
 * Consumer name for APIM TFS - GIFT facility integration.
 * This is required to indicate which service/consumer is sending data to APIM/GIFT.
 */
const CONSUMER = 'DTFS' as const;

/**
 * BSS = default credit type to "Term".
 * GEF/EWCS = default to "Revolving".
 */
const CREDIT_TYPE = {
  BSS: 'Term',
  GEF: 'Revolving',
} as const;

const IS_REVOLVING = {
  BSS: false,
  GEF: true,
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
