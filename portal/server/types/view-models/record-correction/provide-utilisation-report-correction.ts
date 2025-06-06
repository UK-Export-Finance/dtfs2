import { CurrencyAndAmountString, RadioItem, RecordCorrectionFormValueValidationErrors, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { AdditionalCommentsFieldLabels } from '../../../controllers/utilisation-report-service/record-correction/provide-utilisation-report-correction/helpers';
import { BaseViewModel } from '../base-view-model';
import { ErrorSummaryViewModel } from '../error-summary-view-model';

export type CorrectionRequestDetailsViewModel = {
  facilityId: string;
  exporter: string;
  formattedReportedFees: CurrencyAndAmountString;
  reasons: RecordCorrectionReason[];
  formattedReasons: string;
  additionalInfo: string;
  errorTypeHeader: string;
};

/**
 * The form values to pre-populate the provide correction form.
 *
 * The reported currency is not included as its pre-population (or
 * lack thereof) is handled separately by the paymentCurrencyOptions
 * radio items.
 */
export type ProvideCorrectionFormValuesViewModel = {
  facilityId: string | null;
  utilisation: string | null;
  reportedFee: string | null;
  additionalComments: string | null;
};

/**
 * View model for validation errors in the provide utilisation report correction form.
 */
export type ProvideUtilisationReportCorrectionErrorsViewModel = RecordCorrectionFormValueValidationErrors & {
  errorSummary: ErrorSummaryViewModel[];
};

export type ProvideUtilisationReportCorrectionViewModel = BaseViewModel & {
  cancelLinkHref: string;
  correctionRequestDetails: CorrectionRequestDetailsViewModel;
  paymentCurrencyOptions: RadioItem[];
  additionalComments: AdditionalCommentsFieldLabels;
  formValues: ProvideCorrectionFormValuesViewModel;
  errors?: ProvideUtilisationReportCorrectionErrorsViewModel;
};
