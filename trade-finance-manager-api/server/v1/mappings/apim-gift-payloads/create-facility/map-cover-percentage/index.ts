import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';

type GetCoverPercentageParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isBssFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
  isEwcsFacility: boolean;
};

type TfmFacilitySnapshotWithCoveredPercentage = TfmFacilitySnapshot & {
  coveredPercentage?: string | number | null;
};

/**
 * Safely parse a cover percentage value to a number.
 * Strips percentage signs and comma separators before parsing.
 * @param {string | number | null | undefined} value - The raw cover percentage value.
 * @returns {number | null} The parsed number, or null when value is empty or not parseable.
 */
export const toNumber = (value: string | number | null | undefined): number | null => {
  if (!value || value === null || value === '') {
    return null;
  }

  const parsedValue = Number(String(value).replace(/,/g, '').replace('%', ''));

  if (!Number.isNaN(parsedValue)) {
    return parsedValue;
  }

  return null;
};

/**
 * Get facility "cover percentage" as a number for APIM GIFT mapping.
 * - Cash/Contingent facilities use `coverPercentage` (number).
 * - BSS/EWCS facilities use `coveredPercentage` (number string).
 * @param {GetCoverPercentageParams} params - Inputs required to determine which source field to use.
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - Facility snapshot containing cover percentage fields.
 * @param {boolean} params.isBssFacility - If the facility is a BSS facility.
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - If the facility is an EWCS facility.
 * @returns {number | null} Facility cover percentage as a number.
 */
export const mapCoverPercentage = ({
  facilitySnapshot,
  isBssFacility,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
}: GetCoverPercentageParams): number | null => {
  if (isCashFacility || isContingentFacility) {
    return toNumber(facilitySnapshot.coverPercentage);
  }

  if (isBssFacility || isEwcsFacility) {
    const bssEwcsCoveredPercentage = (facilitySnapshot as TfmFacilitySnapshotWithCoveredPercentage).coveredPercentage;

    return toNumber(bssEwcsCoveredPercentage);
  }

  return null;
};
