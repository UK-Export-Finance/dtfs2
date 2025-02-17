import { RecordCorrectionReason, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';

export type FeeRecordCorrectionRequestReviewResponse = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  correctionRequestDetails: {
    facilityId: string;
    exporter: string;
    reasons: RecordCorrectionReason[];
    additionalInfo: string;
    contactEmailAddresses: string[];
  };
};

export type FeeRecordCorrectionRequestReviewErrorKeyResponse = {
  errorKey: string;
};

export type FeeRecordCorrectionRequestReviewResponseBody = FeeRecordCorrectionRequestReviewResponse | FeeRecordCorrectionRequestReviewErrorKeyResponse;
