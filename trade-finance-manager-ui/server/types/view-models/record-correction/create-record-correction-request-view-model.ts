import { RecordCorrectionReason } from '@ukef/dtfs2-common';
import { BaseViewModel } from '@tfm-ui/types/view-models/base-view-model';
import { ErrorSummaryViewModel } from '@tfm-ui/types/view-models/error-summary-view-model';

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
  cancelLinkHref: string;
  bank: { name: string };
  formattedReportPeriod: string;
  feeRecord: {
    facilityId: string;
    exporter: string;
  } | null;
  formValues: CreateRecordCorrectionRequestFormValues;
  errors: CreateRecordCorrectionRequestErrorsViewModel;
  backLinkHref: string;
};
