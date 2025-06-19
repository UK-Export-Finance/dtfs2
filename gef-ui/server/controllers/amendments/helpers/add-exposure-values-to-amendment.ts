import { PortalFacilityAmendmentWithUkefId, createAmendmentFacilityExposure } from '@ukef/dtfs2-common';
import { Facility } from '../../../types/facility';
import * as api from '../../../services/api';

export const addExposureValuesToAmendment = async (amendment: PortalFacilityAmendmentWithUkefId, facility: Facility, facilityId: string, userToken: string) => {
  const { effectiveDate } = amendment;
  const { coverPercentage } = facility;

  if (!coverPercentage || Number.isNaN(coverPercentage) || typeof coverPercentage !== 'number') {
    console.error('Error with cover percentage');

    return { error: true };
  }

  if (!effectiveDate || Number.isNaN(effectiveDate) || typeof effectiveDate !== 'number') {
    console.error('Error with effective date');

    return { error: true };
  }

  let tfmFacility;

  try {
    tfmFacility = await api.getTfmFacility({ facilityId, userToken });
  } catch (error) {
    console.error('Error getting TFM facility: %o', error);
    return { error: true };
  }

  const exchangeRate = tfmFacility?.tfm?.exchangeRate ?? 1;

  const exposure = createAmendmentFacilityExposure(exchangeRate, coverPercentage, amendment, effectiveDate);

  if (exposure === undefined || !exposure.timestamp || Number.isNaN(exposure.ukefExposureValue)) {
    console.error('Error creating exposure for the amendment');
    return { error: true };
  }

  const tfmUpdate = {
    ...amendment.tfm,
    exposure,
  };

  return { tfmUpdate };
};
