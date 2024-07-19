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
    // TODO: DTFS2-7161 - update this link
    return `/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`;
  }

  return `/gef/application-details/${dealId}/facilities/${facilityId}/bank-review-date`;
};
