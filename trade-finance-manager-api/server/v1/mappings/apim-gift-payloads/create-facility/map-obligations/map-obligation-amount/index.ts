import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

type MapGefObligationAmountParams = {
  facilityType?: string;
  facilityAmount: number | null;
};

type MapObligationAmountParams = MapGefObligationAmountParams & {
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  facilityAmount: number | null;
};

/**
 * Maps the obligation amount for a GEF facility.
 * @param {MapGefObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {string} params.facilityType - The facility type (e.g. "Cash", "Contingent").
 * @param {number | null} params.facilityAmount - The facility amount
 * @example
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Contingent', facilityAmount: 128.518888 }); => 89.96
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Cash', facilityAmount: 128.518888 }); => 109.24
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Unknown', facilityAmount: 128.518888 }); => null
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapGefObligationAmount = ({ facilityType, facilityAmount }: MapGefObligationAmountParams): number | null => {
  if (facilityAmount) {
    if (facilityType === FACILITY_TYPE.CASH) {
      const multiplier = UKEF_EXPOSURE_PERCENTAGE.CASH;

      return Math.round(facilityAmount * multiplier * 100) / 100;
    }

    if (facilityType === FACILITY_TYPE.CONTINGENT) {
      const multiplier = UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

      return Math.round(facilityAmount * multiplier * 100) / 100;
    }
  }

  return null;
};

/**
 * Maps the obligation amount for a facility.
 * @param {MapObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if the deal is a BSS/EWCS deal.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {number | null} params.facilityAmount - The facility amount (required for BSS/EWCS; used for GEF obligation calculation).
 * @param {string} [params.facilityType] - The facility type (e.g. "Cash", "Contingent"). Only required for GEF deals.
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapObligationAmount = ({ isBssEwcsDeal, isGefDeal, facilityAmount, facilityType }: MapObligationAmountParams): number | null => {
  if (isBssEwcsDeal) {
    return facilityAmount;
  }

  if (isGefDeal) {
    return mapGefObligationAmount({ facilityType, facilityAmount });
  }

  return null;
};
