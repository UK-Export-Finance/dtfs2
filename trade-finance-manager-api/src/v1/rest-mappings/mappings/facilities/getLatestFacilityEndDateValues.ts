import { TfmFacility } from '@ukef/dtfs2-common';
import { findLatestCompletedAmendment } from '../../helpers/amendment.helpers';

export const getLatestFacilityEndDateValues = (facility: TfmFacility) => {
  if (facility?.amendments?.length) {
    const { isUsingFacilityEndDate, facilityEndDate, bankReviewDate } = findLatestCompletedAmendment(facility.amendments);
    if (isUsingFacilityEndDate != null) {
      return {
        facilityEndDate,
        bankReviewDate,
        isUsingFacilityEndDate,
      };
    }
  }

  const { isUsingFacilityEndDate, facilityEndDate, bankReviewDate } = facility.facilitySnapshot;
  return {
    facilityEndDate,
    bankReviewDate,
    isUsingFacilityEndDate,
  };
};
