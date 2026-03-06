export const APIM_GIFT_INTEGRATION = {
  CONSUMER: 'DTFS',
  DEFAULTS: {
    OVERVIEW: {
      // For BSS, default credit type to "Term". For GEF/EWCS, default to "Revolving".
      CREDIT_TYPE: {
        BSS: 'Term',
        EWCS: 'Revolving',
        GEF: 'Revolving',
      },
      IS_REVOLVING: {
        BSS: false,
        EWCS: true,
        GEF: true,
      },
    },
    RISK_DETAILS: {
      // For BSS/GEF/EWCS, default account to "2" (Corporate) for the "account" field in GIFT.
      ACCOUNT: '2',
      // For BSS/GEF/EWCS, default risk status to "Corporate" for the "riskStatus" field in GIFT.
      RISK_STATUS: 'Corporate',
    },
  },
};
