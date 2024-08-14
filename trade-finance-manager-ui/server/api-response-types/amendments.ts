type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse =
  | {
      isUsingFacilityEndDate: true;
      facilityEndDate?: string;
    }
  | {
      isUsingFacilityEndDate: false;
      bankReviewDate?: string;
    }
  | {};

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
