import { OBLIGATION_AMOUNT } from '../../../constants';
import { roundTo2Decimals } from '../../../helpers/round-to-2-decimals';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

type MapGefObligationAmountParams = {
  facilityAmount: number | null;
  isCashFacility: boolean;
  isContingentFacility: boolean;
};

type MapObligationAmountParams = MapGefObligationAmountParams & {
  isBssFacility: boolean;
  isEwcsFacility: boolean;
};

/**
 * Maps the obligation amount for a GEF facility.
 * @param {MapGefObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {number | null} params.facilityAmount - The facility amount
 * @param {boolean} params.isCashFacility - Flag indicating if the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - Flag indicating if the facility is a Contingent facility.
 * @example
 * const obligationAmount = mapGefObligationAmount({ isContingentFacility: true, facilityAmount: 128.518888 }); => 89.96
 * const obligationAmount = mapGefObligationAmount({ isCashFacility: true, facilityAmount: 128.518888 }); => 109.24
 * const obligationAmount = mapGefObligationAmount({ isCashFacility: false, isContingentFacility: false, facilityAmount: 128.518888 }); => null
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapGefObligationAmount = ({ facilityAmount, isCashFacility, isContingentFacility }: MapGefObligationAmountParams): number | null => {
  if (facilityAmount) {
    if (isCashFacility) {
      const multiplier = UKEF_EXPOSURE_PERCENTAGE.CASH;

      return roundTo2Decimals(facilityAmount * multiplier);
    }

    if (isContingentFacility) {
      const multiplier = UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

      return roundTo2Decimals(facilityAmount * multiplier);
    }
  }

  return null;
};

/**
 * Maps the obligation amount for a facility.
 * @param {MapObligationAmountParams} params - Data required to calculate the obligation amount.
 * @param {number | null} params.facilityAmount - The facility amount (required for BSS/EWCS; used for GEF obligation calculation).
 * @param {boolean} params.isBssFacility - Flag indicating if the facility is a BSS (Bond) facility.
 * @param {boolean} params.isCashFacility - Flag indicating if the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - Flag indicating if the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS (Loan) facility.
 * @returns {number | null} The calculated obligation amount, or null if the facility type is not recognized for a GEF deal.
 */
export const mapObligationAmount = ({
  facilityAmount,
  isBssFacility,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
}: MapObligationAmountParams): number | null => {
  if (isBssFacility || isEwcsFacility) {
    return facilityAmount;
  }

  if (isCashFacility || isContingentFacility) {
    return mapGefObligationAmount({
      isCashFacility,
      isContingentFacility,
      facilityAmount,
    });
  }

  return null;
};
