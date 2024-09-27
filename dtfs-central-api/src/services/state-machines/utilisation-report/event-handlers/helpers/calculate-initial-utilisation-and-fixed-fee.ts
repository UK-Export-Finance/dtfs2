import { calculateInitialUtilisation } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { calculateFixedFee } from './calculate-fixed-fee';

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

  if (!value || !coverStartDate || !coverEndDate || !interestPercentage || !dayCountBasis) {
    throw new Error(`TFM facility values for ${facilityId} is missing`);
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
