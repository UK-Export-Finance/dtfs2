import { isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';

type GetPreviousPageParams = {
  dealId: string;
  facilityId: string;
  dealVersion: number | undefined;
  isUsingFacilityEndDate: boolean;
};

export const getPreviousPage = ({ dealId, facilityId, dealVersion, isUsingFacilityEndDate }: GetPreviousPageParams): string => {
  if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(dealVersion)) || isUsingFacilityEndDate === null) {
    return `/gef/application-details/${dealId}/facilities/${facilityId}/about-facility`;
  }

  if (isUsingFacilityEndDate) {
    return `/gef/application-details/${dealId}/facilities/${facilityId}/facility-end-date`;
  }

  return `/gef/application-details/${dealId}/facilities/${facilityId}/bank-review-date`;
};
