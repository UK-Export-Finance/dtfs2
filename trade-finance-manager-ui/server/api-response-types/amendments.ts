type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse =
  | {
      isUsingFacilityEndDate: true;
      facilityEndDate?: Date;
    }
  | {
      isUsingFacilityEndDate: false;
      bankReviewDate?: Date;
    }
  | {
      isUsingFacilityEndDate: undefined;
      bankReviewDate: undefined;
      facilityEndDate: undefined;
    };

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
