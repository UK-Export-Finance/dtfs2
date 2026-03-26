import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftObligation } from '../../types';

const { OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

type MapObligationsParams = {
  bssSubtypeName: string;
  currency: string;
  effectiveDate: string;
  isBssEwcsDeal: boolean;
  maturityDate: string;
  ukefExposure: number;
};

/**
 * Maps the facility "obligations".
 * If the deal is BSS/EWCS, we need to map the facility subtype name to an obligation subtype code.
 * Otherwise, the obligation subtype code is not required and should be null.
 * @param {MapObligationsParams} params - Data required to build the APIM GIFT "obligations" data.
 * @param {string} params.bssSubtypeName - The BSS facility's subtype name. This is required to map an obligation subtype code expected by APIM GIFT.
 * @param {string} params.currency - The facility currency code to use for the obligation amount.
 * @param {string} params.effectiveDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if the deal is a BSS/EWCS deal.
 * @param {string} params.maturityDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {ApimGiftObligation[]} Mapped obligations array for the APIM GIFT payload.
 */
export const mapObligations = ({
  bssSubtypeName,
  currency,
  effectiveDate,
  isBssEwcsDeal,
  maturityDate,
  ukefExposure,
}: MapObligationsParams): ApimGiftObligation[] => {
  let subtypeCode = null;

  if (isBssEwcsDeal) {
    subtypeCode = OBLIGATION_SUBTYPE_MAP.BSS[bssSubtypeName as keyof typeof OBLIGATION_SUBTYPE_MAP.BSS];
  }

  const obligations = [
    {
      amount: ukefExposure, // TODO: DTFS2-8307: GEF % calculations.
      currency,
      effectiveDate,
      maturityDate,
      subtypeCode,
    },
  ];

  return obligations;
};
