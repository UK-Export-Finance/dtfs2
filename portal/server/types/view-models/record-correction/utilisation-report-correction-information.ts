import { Currency } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';

export type UtilisationReportCorrectionInformationViewModel = BaseViewModel & {
  backLinkHref: string;
  feeRecord: {
    exporter: string;
    reportedFees: {
      currency: Currency;
      formattedAmount: string;
    };
  };
  formattedReasons: string;
  errorSummary: string;
  formattedOldValues: string;
  formattedNewValues: string;
  bankCommentary: string;
};
