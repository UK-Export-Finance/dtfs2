import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';

export type PendingCorrectionViewModel = {
  correctionId: number;
  facilityId: string;
  exporter: string;
  additionalInfo: string;
  formattedReasons: string;
  formattedReportedFees: CurrencyAndAmountString;
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
  uploadedByFullName: string;
  formattedDateUploaded: string;
  corrections: PendingCorrectionViewModel[];
  nextAction: NextActionViewModel;
};
