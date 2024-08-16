import { IsoDateTimeStamp } from '@ukef/dtfs2-common';

type ErrorResponse = {
  status: number;
  data: string;
};

type FacilityEndDateResponse =
  | {
      isUsingFacilityEndDate: true;
      facilityEndDate?: IsoDateTimeStamp;
    }
  | {
      isUsingFacilityEndDate: false;
      bankReviewDate?: IsoDateTimeStamp;
    }
  | {
      isUsingFacilityEndDate: undefined;
      bankReviewDate: undefined;
      facilityEndDate: undefined;
    };

export type GetLatestCompletedAmendmentFacilityEndDateResponse = ErrorResponse | FacilityEndDateResponse;
