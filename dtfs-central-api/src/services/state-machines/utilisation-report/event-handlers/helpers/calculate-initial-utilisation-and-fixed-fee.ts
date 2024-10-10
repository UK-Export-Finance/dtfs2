import { calculateInitialUtilisation, isValidDate } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { calculateInitialFixedFee } from './calculate-initial-fixed-fee';

export type RequiredParams = {
  value?: number | null;
  interestPercentage?: number | null;
  dayCountBasis?: number | null;
  coverStartDate?: string | Date | null;
  coverEndDate?: string | Date | null;
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
export const hasRequiredValues = ({ value, interestPercentage, dayCountBasis, coverStartDate, coverEndDate }: RequiredParams): boolean =>
  Boolean(
    value &&
      coverStartDate &&
      coverEndDate &&
      interestPercentage &&
      dayCountBasis &&
      isValidDate(new Date(coverStartDate)) &&
      isValidDate(new Date(coverEndDate)),
  );

/**
 * calculateInitialUtilisationAndFixedFee
 * calculates initial utilisation and fixed fee for a facility
 * gets the facility from the tfm facilities repo
 * calculates initial utilisation and fixed fee from facility values
 * returns the calculated values
 * @param {String} facilityId
 * @returns {Object} fixedFee and utilisation values
 */
export const calculateInitialUtilisationAndFixedFee = async (facilityId: string) => {
  const tfmFacility = await TfmFacilitiesRepo.findOneByUkefFacilityId(facilityId);

  if (!tfmFacility?.facilitySnapshot) {
    throw new Error(`TFM facility ${facilityId} could not be found`);
  }

  const { value, coverStartDate, coverEndDate, interestPercentage, dayCountBasis } = tfmFacility.facilitySnapshot;

  if (!hasRequiredValues({ value, interestPercentage, dayCountBasis, coverStartDate, coverEndDate })) {
    throw new Error(`TFM facility values for ${facilityId} are missing`);
  }

  const utilisation = calculateInitialUtilisation(value);
  const fixedFee = calculateInitialFixedFee({
    utilisation,
    coverStartDate: parseDate(coverStartDate),
    coverEndDate: parseDate(coverEndDate),
    interestPercentage,
    dayCountBasis,
  });

  return {
    fixedFee,
    utilisation,
  };
};
