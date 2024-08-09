type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse = {
  facilityEndDate: string;
};

type BankReviewDateResponse = {
  facilityEndDate: string;
};

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;

export type GetLatestCompletedAmendmentBankReviewDateResponse = ErrorResponse | BankReviewDateResponse;
