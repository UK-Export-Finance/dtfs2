import { BaseViewModel } from './base-view-model';

export type PendingCorrectionViewModel = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  additionalInfo: string;
};

export type NextActionViewModel =
  | {
      reportCurrentlyDueForUpload: {
        formattedReportPeriod: string;
      };
    }
  | {
      reportSoonToBeDueForUpload: {
        formattedReportPeriod: string;
        formattedUploadFromDate: string;
      };
    };

export type PendingCorrectionsViewModel = BaseViewModel & {
  formattedReportPeriod: string;
  uploadedByUserName: string;
  formattedDateUploaded: string;
  corrections: PendingCorrectionViewModel[];
  nextAction: NextActionViewModel;
};
