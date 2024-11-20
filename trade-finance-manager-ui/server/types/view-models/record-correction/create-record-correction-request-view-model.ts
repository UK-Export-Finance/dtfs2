import { BaseViewModel } from '../base-view-model';
import { CreateRecordCorrectionRequestErrorsViewModel } from './create-record-correction-request-errors-view-model';

export type CreateRecordCorrectionRequestViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  feeRecord: {
    facilityId: string;
    exporter: string;
  };
  errors: CreateRecordCorrectionRequestErrorsViewModel;
};
