import { Currency } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftObligation } from '../../types';
import { mapObligationAmount } from './map-obligation-amount';

const { DEFAULTS, OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

type MapObligationsParams = {
  bssSubtypeName?: string;
  currency: Currency;
  isBssFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
  isEwcsFacility: boolean;
  facilityAmount: number | null;
};

/**
 * Maps the facility "obligations".
 * If the deal is BSS/EWCS, we need to map the facility subtype name to an obligation subtype code.
 * Otherwise, the obligation subtype code is not required and should be null.
 * @param {MapObligationsParams} params - Data required to build the APIM GIFT "obligations" data.
 * @param {string} [params.bssSubtypeName] - The BSS facility's subtype name. Only used when `isBssEwcsDeal` is true.
 * @param {Currency} params.currency - The facility currency code to use for the obligation amount.
 * @param {boolean} params.isBssFacility - Flag indicating if the facility is a BSS facility.
 * @param {boolean} params.isCashFacility - Flag indicating if the facility is a cash facility.
 * @param {boolean} params.isContingentFacility - Flag indicating if the facility is a contingent facility.
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS facility.
 * @param {number | null} params.facilityAmount - The facility amount (required for BSS/EWCS; used for GEF obligation calculation).
 * @returns {ApimGiftObligation[]} Mapped obligations array for the APIM GIFT payload.
 */
export const mapObligations = ({
  bssSubtypeName,
  currency,
  isBssFacility,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
  facilityAmount,
}: MapObligationsParams): ApimGiftObligation[] => {
  let subtypeCode = null;

  if (isBssFacility && bssSubtypeName) {
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
      amount: mapObligationAmount({
        facilityAmount,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
      }),
      currency,
      repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
      subtypeCode,
    },
  ];

  return obligations;
};
