import { ApimGiftObligation } from '../../types';

type MapObligationsParams = {
  currency: string;
  effectiveDate: string;
  maturityDate: string;
  subtypeName: string;
  ukefExposure: number;
};

/**
 * Maps the facility "obligations".
 * @param {MapObligationsParams} params - Data required to build the APIM GIFT "obligations" data.
 * @param {string} params.currency - The party URNs.
 * @param {string} params.effectiveDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {string} params.maturityDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @param {string} params.subtypeName - The facility subtype name. This will need to be mapped into an obligation subtype code expected by APIM GIFT.
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {ApimGiftObligation[]} Mapped obligations array for the APIM GIFT payload.
 */
export const mapObligations = ({ currency, effectiveDate, maturityDate, subtypeName, ukefExposure }: MapObligationsParams): ApimGiftObligation[] => {
  const obligations = [
    {
      amount: ukefExposure, // TODO: DTFS2-8307: GEF % calculations.
      currency,
      effectiveDate,
      maturityDate,
      subtypeCode: `TODO - ${subtypeName}`,
    },
  ];

  return obligations;
};

// TODO: we need to get obligation subtype codes from APIM and map DTFS obligation subtype name into a code, for obligations
// e.g OST001
