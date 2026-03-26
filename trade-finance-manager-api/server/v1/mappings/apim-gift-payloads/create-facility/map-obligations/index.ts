import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftObligation } from '../../types';
import { mapObligationAmount } from './map-obligation-amount';

const { OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

type MapObligationsParams = {
  currency: string;
  effectiveDate: string;
  facilityType?: string;
  isGefDeal: boolean;
  maturityDate: string;
  subtypeName: string;
  ukefExposure: number;
};

/**
 * Maps the facility "obligations".
 * @param {MapObligationsParams} params - Data required to build the APIM GIFT "obligations" data.
 * @param {string} params.currency - The facility currency code to use for the obligation amount.
 * @param {string} params.effectiveDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {string} [params.facilityType] - The facility type (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {string} params.maturityDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @param {string} params.subtypeName - The facility subtype name. This will need to be mapped into an obligation subtype code expected by APIM GIFT.
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {ApimGiftObligation[]} Mapped obligations array for the APIM GIFT payload.
 */
export const mapObligations = ({
  currency,
  effectiveDate,
  isGefDeal,
  facilityType,
  maturityDate,
  subtypeName,
  ukefExposure,
}: MapObligationsParams): ApimGiftObligation[] => {
  const obligations = [
    {
      amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
      currency,
      effectiveDate,
      maturityDate,
      // TODO: DTFS2-8338
      subtypeCode: OBLIGATION_SUBTYPE_MAP.BSS[subtypeName as keyof typeof OBLIGATION_SUBTYPE_MAP.BSS],
    },
  ];

  return obligations;
};
