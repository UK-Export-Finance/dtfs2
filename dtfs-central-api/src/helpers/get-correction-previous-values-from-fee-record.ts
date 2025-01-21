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

export const getCorrectionPreviousValuesFromFeeRecord = (feeRecord: FeeRecordEntity, reasons: RecordCorrectionReason[]): RecordCorrectionValues => {
  return getCorrectionValues(feeRecord, reasons, valueGetters);
};
