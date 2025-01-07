import { CurrencyAndAmount, PortalSessionUser } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '../../primary-nav-key';

export type UtilisationReportCorrectionInformationViewModel = {
  user: PortalSessionUser;
  primaryNav: PrimaryNavKey;
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
