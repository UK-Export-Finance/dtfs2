import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

type MapBssEwcsObligationAmountParams = {
  facilityAmount: number;
  ukefExposure: number;
};

type MapGefObligationAmountParams = {
  facilityType?: string;
  ukefExposure: number;
};

type MapObligationAmountParams = MapGefObligationAmountParams & {
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  facilityAmount: number;
};

export const mapBssEwcsObligationAmount = ({ facilityAmount, ukefExposure }: MapBssEwcsObligationAmountParams): number => facilityAmount * ukefExposure;

/**
 * Maps the obligation amount for a GEF facility.
 * @param {MapGefObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {string} params.facilityType - The facility type (e.g. "Cash", "Contingent").
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @example
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Contingent', ukefExposure: 128.518888 }); => 89.96
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Cash', ukefExposure: 128.518888 }); => 109.24
 * const obligationAmount = mapGefObligationAmount({ facilityType: 'Unknown', ukefExposure: 128.518888 }); => null
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapGefObligationAmount = ({ facilityType, ukefExposure }: MapGefObligationAmountParams): number | null => {
  if (facilityType === FACILITY_TYPE.CASH) {
    const multiplier = UKEF_EXPOSURE_PERCENTAGE.CASH;

    return Math.round(ukefExposure * multiplier * 100) / 100;
  }

  if (facilityType === FACILITY_TYPE.CONTINGENT) {
    const multiplier = UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

    return Math.round(ukefExposure * multiplier * 100) / 100;
  }

  return null;
};

/**
 * Maps the obligation amount for a facility.
 * @param {MapObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if the deal is a BSS/EWCS deal.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {number} [params.facilityAmount] - The facility amount. Only required for BSS/EWCS deals.
 * @param {string} [params.facilityType] - The facility type (e.g. "Cash", "Contingent"). Only required for GEF deals.
 * @param {number} params.ukefExposure - The facility's UKEF exposure.
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapObligationAmount = ({ isBssEwcsDeal, isGefDeal, facilityAmount, facilityType, ukefExposure }: MapObligationAmountParams): number | null => {
  if (isBssEwcsDeal) {
    return mapBssEwcsObligationAmount({ facilityAmount, ukefExposure });
  }

  if (isGefDeal) {
    return mapGefObligationAmount({ facilityType, ukefExposure });
  }

  return null;
};
