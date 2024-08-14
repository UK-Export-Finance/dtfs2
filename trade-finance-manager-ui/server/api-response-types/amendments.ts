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
  | {
      isUsingFacilityEndDate: undefined;
      bankReviewDate: undefined;
      facilityEndDate: undefined;
    };

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
