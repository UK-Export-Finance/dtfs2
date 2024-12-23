import { CurrencyAndAmountString, RadioItem, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '../../primary-nav-key';

export type CorrectionRequestDetailsViewModel = {
  facilityId: string;
  exporter: string;
  formattedReportedFees: CurrencyAndAmountString;
  reasons: RecordCorrectionReason[];
  formattedReasons: string;
  additionalInfo: string;
  errorTypeHeader: string;
};

export type ProvideUtilisationReportCorrectionViewModel = {
  primaryNav: PrimaryNavKey;
  correctionRequestDetails: CorrectionRequestDetailsViewModel;
  paymentCurrencyOptions: RadioItem[];
};
