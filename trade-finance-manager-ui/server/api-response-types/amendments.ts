type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse = {
  facilityEndDate?: string;
  bankReviewDate?: string;
  isUsingFacilityEndDate?: boolean;
};

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
