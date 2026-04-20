import { DAY_BASIS_CODE } from '../../../constants';
import { ApimGiftDayBasisType } from '../../../types';

/**
 * Maps a TFM "day count basis" to its corresponding GIFT day basis code.
 * @param {string} dayCountBasis - The day count basis to map.
 * @returns {ApimGiftDayBasisType | null} The corresponding day basis code, or null if not found.
 */
export const mapDayBasisCode = (dayCountBasis: string): ApimGiftDayBasisType | null => {
  switch (dayCountBasis) {
    case '360':
      return DAY_BASIS_CODE.ACTUAL_360;
    case '365':
      return DAY_BASIS_CODE.ACTUAL_365;
    default:
      return null;
  }
};
