import { calculateDrawnAmount, isValidDate } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { calculateInitialFixedFee } from './calculate-initial-fixed-fee';
import { getSpecificTfmFacilityValues } from '../../../../../helpers';

export type RequiredParams = {
  value?: number | null;
  interestPercentage?: number | null;
  dayCountBasis?: number | null;
  coverStartDate?: string | Date | null;
  coverEndDate?: string | Date | null;
  coverPercentage?: number | null;
};

/**
 * parses date to the correct format
 * date could be passed as string or different type of timestamp
 * @param date
 * @returns parsed date in correct format
 */
export const parseDate = (date: string | Date | number | null): Date => {
  if (!date) {
    throw new Error('Invalid date');
  }
  return new Date(date);
};

/**
 * checks that all required values are present
 * checks that cover start and end dates are in date format
 * @param value
 * @param interestPercentage
 * @param dayCountBasis
 * @param coverStartDate
 * @param coverEndDate
 * @returns true if all values are present and in the correct format
 */
export const hasRequiredValues = ({ value, interestPercentage, dayCountBasis, coverStartDate, coverEndDate, coverPercentage }: RequiredParams): boolean =>
  Boolean(
    value &&
      coverStartDate &&
      coverEndDate &&
      interestPercentage &&
      dayCountBasis &&
      coverPercentage &&
      isValidDate(new Date(coverStartDate)) &&
      isValidDate(new Date(coverEndDate)),
  );

/**
 * calculateInitialUtilisationAndFixedFee
 * calculates initial utilisation and fixed fee for a facility
 * gets the facility from the tfm facilities repo
 * calculates initial utilisation and fixed fee from facility values
 * calculates ukef share of utilisation from provided utilisation value and cover percentage
 * returns the calculated values
 * @param {String} facilityId
 * @returns {Object} fixedFee and utilisation values
 */
export const calculateInitialUtilisationAndFixedFee = async (facilityId: string) => {
  const { value, coverStartDate, coverEndDate, interestPercentage, dayCountBasis, coverPercentage } = await getSpecificTfmFacilityValues(facilityId);

  if (!hasRequiredValues({ value, interestPercentage, dayCountBasis, coverStartDate, coverEndDate, coverPercentage })) {
    throw new Error(`TFM facility values for ${facilityId} are missing`);
  }

  const ukefShareOfInitialUtilisation = new Big(calculateDrawnAmount(value, coverPercentage)).round(2).toNumber();

  const fixedFee = calculateInitialFixedFee({
    ukefShareOfUtilisation: ukefShareOfInitialUtilisation,
    coverStartDate: parseDate(coverStartDate),
    coverEndDate: parseDate(coverEndDate),
    interestPercentage,
    dayCountBasis,
  });

  return {
    fixedFee,
    utilisation: ukefShareOfInitialUtilisation,
  };
};
