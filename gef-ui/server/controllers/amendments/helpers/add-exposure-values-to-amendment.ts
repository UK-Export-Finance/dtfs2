import { PortalFacilityAmendmentWithUkefId, createAmendmentFacilityExposure, isNotValidNumber, DEFAULT_EXCHANGE_RATE } from '@ukef/dtfs2-common';
import { Facility } from '../../../types/facility';
import * as api from '../../../services/api';

/**
 * helper to add exposure values to an amendment
 * checks if coverPercentage and effectiveDate are valid
 * retrieves TFM facility to get exchange rate
 * calculates exposure values based on coverPercentage, effectiveDate, and exchange rate
 * returns an object with tfmUpdate containing the exposure values
 * @param amendment - current amendment
 * @param facility - facility to which the amendment applies
 * @param facilityId
 * @param userToken
 * @returns tfmUpdate with exposure values or error object
 */
export const addExposureValuesToAmendment = async (amendment: PortalFacilityAmendmentWithUkefId, facility: Facility, facilityId: string, userToken: string) => {
  const { effectiveDate } = amendment;
  const { coverPercentage } = facility;

  /**
   * Validations for coverPercentage and effectiveDate
   * Checks if they are defined, and are a number
   * If not, logs an error and returns an error object
   */
  if (!coverPercentage || !effectiveDate || isNotValidNumber(effectiveDate) || isNotValidNumber(coverPercentage)) {
    console.error('Error with cover percentage or effective date');

    return { error: true };
  }

  let tfmFacility;

  try {
    tfmFacility = await api.getTfmFacility({ facilityId, userToken });
  } catch (error) {
    console.error('Error fetching TFM facility %s %o', facilityId, error);
    return { error: true };
  }

  // if exchangeRate is not defined, default to 1
  const exchangeRate = tfmFacility?.tfm?.exchangeRate ?? DEFAULT_EXCHANGE_RATE;

  const exposure = createAmendmentFacilityExposure(exchangeRate, coverPercentage, amendment, effectiveDate);

  if (!exposure?.timestamp || Number.isNaN(exposure?.ukefExposureValue)) {
    console.error('Error generating exposure for the facility amendment %s', facilityId);

    return { error: true };
  }

  const tfmUpdate = {
    ...amendment.tfm,
    exposure,
  };

  return { tfmUpdate };
};
