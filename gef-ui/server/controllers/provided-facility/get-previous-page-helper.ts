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
    // TODO: DTFS2-7161 - update this link
    return `/gef/application-details/${dealId}/facilities/${facilityId}/about-facility`;
  }

  return `/gef/application-details/${dealId}/facilities/${facilityId}/bank-review-date`;
};
