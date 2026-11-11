import { Currency } from '@ukef/dtfs2-common';
import { BaseViewModel } from '@ukef/portal-ui/server/types/view-models/base-view-model';

export type UtilisationReportCorrectionInformationViewModel = BaseViewModel & {
  cancelLinkHref: string;
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
