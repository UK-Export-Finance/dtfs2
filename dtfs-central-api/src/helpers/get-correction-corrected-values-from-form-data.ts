import { RECORD_CORRECTION_REASON, RecordCorrectionReason, RecordCorrectionTransientFormData, RecordCorrectionValues } from '@ukef/dtfs2-common';
import { CorrectionValueGetter, getCorrectionValues } from './get-correction-values';

const reportedCurrencyGetter: CorrectionValueGetter<RecordCorrectionTransientFormData> = (formData) => ({
  feesPaidToUkefForThePeriodCurrency: formData.reportedCurrency,
});

const facilityIdGetter: CorrectionValueGetter<RecordCorrectionTransientFormData> = (formData) => ({
  facilityId: formData.facilityId,
});

const utilisationGetter: CorrectionValueGetter<RecordCorrectionTransientFormData> = (formData) => ({
  facilityUtilisation: formData.utilisation,
});

const reportedFeeGetter: CorrectionValueGetter<RecordCorrectionTransientFormData> = (formData) => ({
  feesPaidToUkefForThePeriod: formData.reportedFee,
});

const emptyGetter: CorrectionValueGetter<RecordCorrectionTransientFormData> = () => ({});

const valueGetters: Record<RecordCorrectionReason, CorrectionValueGetter<RecordCorrectionTransientFormData>> = {
  [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: reportedCurrencyGetter,
  [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: facilityIdGetter,
  [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: utilisationGetter,
  [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: reportedFeeGetter,
  [RECORD_CORRECTION_REASON.OTHER]: emptyGetter,
};

/**
 * Extracts the corrected values from the form data based on the reasons provided
 * to save against the correction record in the database
 * @param formData - the form data
 * @param reasons - the reasons for the record correction
 * @returns the corrected values
 */
export const getCorrectionCorrectedValuesFromFormData = (
  formData: RecordCorrectionTransientFormData,
  reasons: RecordCorrectionReason[],
): RecordCorrectionValues => {
  return getCorrectionValues(formData, reasons, valueGetters);
};
