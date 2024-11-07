import { BaseViewModel } from '../base-view-model';

export type CreateRecordCorrectionRequestViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  feeRecord: {
    facilityId: string;
    exporter: string;
    obligorUrn: string;
    obligorName: string;
  };
};
