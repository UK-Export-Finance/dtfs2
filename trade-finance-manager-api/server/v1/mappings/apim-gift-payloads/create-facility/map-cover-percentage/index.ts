import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';

type GetCoverPercentageParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

type TfmFacilitySnapshotWithCoveredPercentage = TfmFacilitySnapshot & {
  coveredPercentage?: string | number | null;
};

const toNumber = (value: string | number | null | undefined): number | null => {
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
 * - GEF deals use `coverPercentage` (number).
 * - BSS/EWCS deals use `coveredPercentage` (string number).
 * @param {GetCoverPercentageParams} params - Inputs required to determine which source field to use.
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - Facility snapshot containing cover percentage fields.
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if deal is BSS/EWCS.
 * @param {boolean} params.isGefDeal - Flag indicating if deal is GEF.
 * @returns {number | null} Facility cover percentage as a number.
 */
export const mapCoverPercentage = ({ facilitySnapshot, isBssEwcsDeal, isGefDeal }: GetCoverPercentageParams): number | null => {
  if (isGefDeal) {
    return toNumber(facilitySnapshot.coverPercentage);
  }

  if (isBssEwcsDeal) {
    const bssEwcsCoveredPercentage = (facilitySnapshot as TfmFacilitySnapshotWithCoveredPercentage).coveredPercentage;

    return toNumber(bssEwcsCoveredPercentage);
  }

  return null;
};
