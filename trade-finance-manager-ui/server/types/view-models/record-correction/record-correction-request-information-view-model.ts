import { BaseViewModel } from '../base-view-model';

export type RecordCorrectionRequestInformationViewModel = BaseViewModel & {
  bank: { name: string };
  formattedReportPeriod: string;
  reportId: string;
  feeRecordId: string;
  facilityId: string;
  exporter: string;
  reasonForRecordCorrection: string;
  additionalInfo: string;
  contactEmailAddresses: string;
};
