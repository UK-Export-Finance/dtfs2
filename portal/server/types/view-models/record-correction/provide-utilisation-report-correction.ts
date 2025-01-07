import { CurrencyAndAmountString, RadioItem, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { AdditionalCommentsFieldLabels } from '../../../controllers/utilisation-report-service/record-correction/provide-utilisation-report-correction/helpers';
import { BaseViewModel } from '../base-view-model';

export type CorrectionRequestDetailsViewModel = {
  facilityId: string;
  exporter: string;
  formattedReportedFees: CurrencyAndAmountString;
  reasons: RecordCorrectionReason[];
  formattedReasons: string;
  additionalInfo: string;
  errorTypeHeader: string;
};

export type ProvideUtilisationReportCorrectionViewModel = BaseViewModel & {
  correctionRequestDetails: CorrectionRequestDetailsViewModel;
  paymentCurrencyOptions: RadioItem[];
  additionalComments: AdditionalCommentsFieldLabels;
};
