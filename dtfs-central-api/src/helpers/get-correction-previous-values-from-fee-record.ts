import { FeeRecordEntity, RECORD_CORRECTION_REASON, RecordCorrectionReason, RecordCorrectionValues } from '@ukef/dtfs2-common';
import { CorrectionValueGetter, getCorrectionValues } from './get-correction-values';

const reportedCurrencyGetter: CorrectionValueGetter<FeeRecordEntity> = (feeRecord) => ({
  feesPaidToUkefForThePeriodCurrency: feeRecord.feesPaidToUkefForThePeriodCurrency,
});

const facilityIdGetter: CorrectionValueGetter<FeeRecordEntity> = (feeRecord) => ({
  facilityId: feeRecord.facilityId,
});

const utilisationGetter: CorrectionValueGetter<FeeRecordEntity> = (feeRecord) => ({
  facilityUtilisation: feeRecord.facilityUtilisation,
});

const reportedFeeGetter: CorrectionValueGetter<FeeRecordEntity> = (feeRecord) => ({
  feesPaidToUkefForThePeriod: feeRecord.feesPaidToUkefForThePeriod,
});

const emptyGetter: CorrectionValueGetter<FeeRecordEntity> = () => ({});

const valueGetters: Record<RecordCorrectionReason, CorrectionValueGetter<FeeRecordEntity>> = {
  [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: reportedCurrencyGetter,
  [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: facilityIdGetter,
  [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: utilisationGetter,
  [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: reportedFeeGetter,
  [RECORD_CORRECTION_REASON.OTHER]: emptyGetter,
};

/**
 * Extracts the previous values from the fee record based on the reasons provided
 * to save against the correction record in the database
 * @param feeRecord - the fee record
 * @param reasons - the reasons for the record correction
 * @returns the previous values
 */
export const getCorrectionPreviousValuesFromFeeRecord = (feeRecord: FeeRecordEntity, reasons: RecordCorrectionReason[]): RecordCorrectionValues =>
  getCorrectionValues(feeRecord, reasons, valueGetters);
