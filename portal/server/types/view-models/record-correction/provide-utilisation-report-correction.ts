import { CurrencyAndAmountString, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '../../primary-nav-key';

export type CorrectionRecordViewModel = {
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmountString;
  reasons: RecordCorrectionReason[];
  formattedReasons: string;
  additionalInfo: string;
};

export type ProvideUtilisationReportCorrectionViewModel = {
  primaryNav: PrimaryNavKey;
  correctionRecord: CorrectionRecordViewModel;
};
