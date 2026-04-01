import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftObligation } from '../../types';
import { mapObligationAmount } from './map-obligation-amount';

const { DEFAULTS, OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

type MapObligationsParams = {
  bssSubtypeName?: string;
  currency: string;
  effectiveDate: string;
  isBssEwcsDeal: boolean;
  facilityType?: string;
  isGefDeal: boolean;
  maturityDate: string;
  ukefExposure: number;
};

/**
 * Maps the facility "obligations".
 * If the deal is BSS/EWCS, we need to map the facility subtype name to an obligation subtype code.
 * Otherwise, the obligation subtype code is not required and should be null.
 * @param {MapObligationsParams} params - Data required to build the APIM GIFT "obligations" data.
 * @param {string} [params.bssSubtypeName] - The BSS facility's subtype name. Only used when `isBssEwcsDeal` is true.
 * @param {string} params.currency - The facility currency code to use for the obligation amount.
 * @param {string} params.effectiveDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if the deal is a BSS/EWCS deal.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {string} [params.facilityType] - The facility type (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {string} params.maturityDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {ApimGiftObligation[]} Mapped obligations array for the APIM GIFT payload.
 */
export const mapObligations = ({
  bssSubtypeName,
  currency,
  effectiveDate,
  isBssEwcsDeal,
  isGefDeal,
  facilityType,
  maturityDate,
  ukefExposure,
}: MapObligationsParams): ApimGiftObligation[] => {
  let subtypeCode = null;

  if (isBssEwcsDeal && bssSubtypeName) {
    const mappedSubtypeCode = OBLIGATION_SUBTYPE_MAP.BSS[bssSubtypeName as keyof typeof OBLIGATION_SUBTYPE_MAP.BSS];

    /**
     * Handle an edge case where the facility subtype name is not mapped to an obligation subtype code.
     * In this case, we should set the subtype code to null to avoid sending an undefined string value to APIM GIFT.
     * This is extremely unlikely, but required for type safety, until BSS/EWCS facility subtypes are fully standardised and mapping can be removed.
     */
    if (typeof mappedSubtypeCode === 'undefined') {
      subtypeCode = null;
    } else {
      subtypeCode = mappedSubtypeCode;
    }
  }

  const obligations = [
    {
      amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
      currency,
      effectiveDate,
      maturityDate,
      repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
      subtypeCode,
    },
  ];

  return obligations;
};
