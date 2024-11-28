import { ReportPeriod, SessionBank } from '@ukef/dtfs2-common';

export type FeeRecordCorrectionRequestReviewResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  correctionRequestDetails: {
    facilityId: string;
    exporter: string;
    reasons: string[];
    additionalInfo: string;
    contactEmailAddress: string;
  };
};
