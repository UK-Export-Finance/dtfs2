import { CurrencyAndAmount } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';

export type UtilisationReportCorrectionInformationViewModel = BaseViewModel & {
  cancelLinkHref: string;
  backLinkHref: string;
  feeRecord: {
    exporter: string;
    reportedFees: CurrencyAndAmount;
  };
  formattedReasons: string;
  errorSummary: string;
  formattedOldValues: string;
  formattedNewValues: string;
  bankCommentary: string;
};
