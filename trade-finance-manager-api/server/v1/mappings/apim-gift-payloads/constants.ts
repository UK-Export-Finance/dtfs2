import { ProductTypeCode } from './types';

/**
 * Deal type names used in APIM/GIFT integration.
 * These are used to map product type codes to human-readable deal type names.
 */
export const DEAL_TYPE = {
  BSS: 'BSS',
  EWCS: 'EWCS',
  GEF: 'GEF',
};

/**
 * APIM/GIFT product type codes.
 * An "Unknown" code is included to use as a fallback value when the deal type is not recognized, to avoid sending null values to APIM/GIFT which would cause errors.
 * Note that this is an extreme edge case that will probably never occur in practice, as the deal type is expected to always be recognized for valid deals.
 * This is included as a safeguard to ensure that the integration can handle unexpected deal types without breaking.
 * If the "Unknown" product type code is sent to APIM/GIFT, this will trigger an alert in APIM for the unexpected product type code value, which can be investigated by the team.
 */
export const PRODUCT_TYPE_CODES = {
  BSS: 'PRT003',
  GEF: 'PRT004',
  UNKNOWN: 'UNKNOWN_PRODUCT_TYPE_CODE',
} as const;

/**
 * Mapping of APIM/GIFT product type codes to deal types.
 */
export const PRODUCT_TYPE_CODES_TO_DEAL_TYPE = {
  [PRODUCT_TYPE_CODES.BSS]: DEAL_TYPE.BSS,
  [PRODUCT_TYPE_CODES.GEF]: DEAL_TYPE.GEF,
  [PRODUCT_TYPE_CODES.UNKNOWN]: 'UNKNOWN',
} as const satisfies Record<ProductTypeCode, string>;

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
  BID_BOND: 'OST014',
  MAINTENANCE_BOND: 'OST017',
  PERFORMANCE_BOND: 'OST013',
  PROGRESS_PAYMENT_BOND: 'OST015',
  RETENTION_BOND: 'OST018',
  STANDBY_LETTER_OF_CREDIT: 'OST020',
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
 * TFM fee frequencies.
 * These are required to map the facility's fee frequency from TFM to the expected fee frequency values in APIM/GIFT.
 */
export const TFM_FEE_FREQUENCIES = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
  EVERY_BUSINESS_DAY: 'Every business day',
  AT_MATURITY: 'At maturity',
} as const;

/**
 * APIM/GIFT accrual frequency codes.
 * These are required to map the facility's accrual frequency from TFM to the expected accrual frequency code in APIM/GIFT.
 */
export const ACCRUAL_FREQUENCY_CODE_MAP = {
  MONTHLY: 'FREQ1MON',
  QUARTERLY: 'FREQ3MON',
  SEMI_ANNUALLY: 'FREQ6MON',
  ANNUALLY: 'FREQ12MON',
  EVERY_BUSINESS_DAY: 'FREQEBD',
} as const;

export const ACCRUAL_SCHEDULE_TYPE_CODES = {
  PREMIUM: 'PAC01',
} as const;

/**
 * APIM/GIFT amendment types.
 * These are required to indicate the type of amendment being made to a facility in APIM/GIFT.
 */
const AMENDMENT_TYPE = {
  INCREASE_AMOUNT: 'IncreaseAmount',
  DECREASE_AMOUNT: 'DecreaseAmount',
  REPLACE_EXPIRY_DATE: 'ReplaceExpiryDate',
} as const;

/**
 * Consumer name for APIM TFS - GIFT facility integration.
 * This is required to indicate which service/consumer is sending data to APIM/GIFT.
 */
const CONSUMER = 'DTFS' as const;

/**
 * PRT003 (BSS) = default credit type to "Term".
 * PRT004 (GEF) = default credit type to "Revolver".
 * UNKNOWN_PRODUCT_TYPE_CODE = default credit type to "Unknown", which is a fallback value for unrecognized deal types.
 */
const CREDIT_TYPE = {
  PRT003: 'Term',
  PRT004: 'Revolver',
  UNKNOWN_PRODUCT_TYPE_CODE: 'UNKNOWN_CREDIT_TYPE',
} as const;

/**
 * Counterparty role codes
 * BOND_BENEFICIARY is only sent to APIM/GIFT if a relevant party URN is available.
 */
export const COUNTERPARTY_ROLE_CODE = {
  BOND_BENEFICIARY: 'CRT004',
  BOND_GIVER: 'CRT005',
  ISSUING_BANK: 'CRT043',
} as const;

/**
 * GIFT day basis codes.
 * These are required to map the facility's day count basis from TFM to the expected day basis code in APIM/GIFT when mapping the facility "accrual schedules" data for the APIM GIFT payload.
 */
export const DAY_BASIS_CODE = {
  ACTUAL_360: 'ACTUAL_360',
  ACTUAL_365: 'ACTUAL_365',
} as const;

/**
 * For BSS/GEF/EWCS,
 * default account to "2" (Corporate) for the "account" field in GIFT.
 */
const GIFT_ACCOUNT = '2' as const;

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
  ACCRUAL_FREQUENCY_CODE_MAP,
  AMENDMENT_TYPE,
  CONSUMER,
  DEFAULTS: {
    ACCRUAL_SCHEDULE: {
      ADDITIONAL_RATE: 0,
      BASE_RATE: 0,
      TYPE_CODE: ACCRUAL_SCHEDULE_TYPE_CODES.PREMIUM,
    },
    COUNTERPARTY_ROLE_CODE: {
      BSS: {
        BOND_BENEFICIARY: COUNTERPARTY_ROLE_CODE.BOND_BENEFICIARY,
        BOND_GIVER: COUNTERPARTY_ROLE_CODE.BOND_GIVER,
      },
      GEF: {
        ISSUING_BANK: COUNTERPARTY_ROLE_CODE.ISSUING_BANK,
      },
    },
    OVERVIEW: {
      CREDIT_TYPE,
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
