type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse = {
  facilityEndDate: string;
};

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
