import { isFacilityEndDateEnabledOnGefVersion, parseDealVersion } from '@ukef/dtfs2-common';

type GetNextPageParams = {
  dealId: string;
  facilityId: string;
  dealVersion: number | undefined;
  isUsingFacilityEndDate: boolean;
};

export const getNextPage = ({ dealId, facilityId, dealVersion, isUsingFacilityEndDate }: GetNextPageParams): string => {
  if (!isFacilityEndDateEnabledOnGefVersion(parseDealVersion(dealVersion))) {
    return `/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`;
  }

  if (isUsingFacilityEndDate) {
    return `/gef/application-details/${dealId}/facilities/${facilityId}/facility-end-date`;
  }

  return `/gef/application-details/${dealId}/facilities/${facilityId}/bank-review-date`;
};
