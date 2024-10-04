import { calculateInitialUtilisation, isDate } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { calculateFixedFee } from './calculate-fixed-fee';

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
export const hasRequiredValues = (
  value: number,
  interestPercentage: number,
  dayCountBasis: number,
  coverStartDate: string | Date | null,
  coverEndDate: string | Date | null,
): boolean => Boolean(value && coverStartDate && coverEndDate && interestPercentage && dayCountBasis && isDate(coverStartDate) && isDate(coverEndDate));

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

  if (!hasRequiredValues(value, interestPercentage, dayCountBasis, coverStartDate, coverEndDate)) {
    throw new Error(`TFM facility values for ${facilityId} are missing`);
  }

  const utilisation = calculateInitialUtilisation(value);
  const fixedFee = calculateFixedFee({
    utilisation,
    coverStartDate: coverStartDate as Date,
    coverEndDate: coverEndDate as Date,
    interestPercentage,
    dayCountBasis,
  });

  return {
    fixedFee,
    utilisation,
  };
};
