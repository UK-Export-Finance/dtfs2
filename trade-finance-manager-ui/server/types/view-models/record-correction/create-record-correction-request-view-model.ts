import { BaseViewModel } from '../base-view-model';
import { CreateRecordCorrectionRequestErrorsViewModel } from './create-record-correction-request-errors-view-model';
import { CreateRecordCorrectionRequestFormValues } from './create-record-correction-request-form-values';

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
