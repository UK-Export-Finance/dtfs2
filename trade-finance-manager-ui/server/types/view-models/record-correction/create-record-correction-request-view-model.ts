import { RecordCorrectionReason } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type CreateRecordCorrectionRequestErrorsViewModel = {
  reasonsErrorMessage?: string;
  additionalInfoErrorMessage?: string;
  errorSummary: ErrorSummaryViewModel[];
};

export type CreateRecordCorrectionRequestFormValues = {
  reasons?: RecordCorrectionReason[];
  additionalInfo?: string;
};

export type CreateRecordCorrectionRequestViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  feeRecord: {
    facilityId: string;
    exporter: string;
  };
  formValues: CreateRecordCorrectionRequestFormValues;
  errors: CreateRecordCorrectionRequestErrorsViewModel;
};
