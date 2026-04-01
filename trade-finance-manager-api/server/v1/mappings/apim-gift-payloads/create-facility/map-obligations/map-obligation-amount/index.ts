import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

type MapObligationAmountParams = {
  isGefDeal: boolean;
  facilityType?: string;
  ukefExposure: number;
};

/**
 * Maps the obligation amount for a facility.
 * @param {MapObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {string} [params.facilityType] - The facility type (e.g. "Cash", "Contingent"). Only required for GEF deals.
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapObligationAmount = ({ isGefDeal, facilityType, ukefExposure }: MapObligationAmountParams): number | null => {
  if (isGefDeal) {
    if (facilityType === FACILITY_TYPE.CASH) {
      return ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CASH;
    }

    if (facilityType === FACILITY_TYPE.CONTINGENT) {
      return ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;
    }

    return null;
  }

  return ukefExposure;
};
