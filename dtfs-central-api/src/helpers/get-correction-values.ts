import { RecordCorrectionReason, RecordCorrectionValues } from '@ukef/dtfs2-common';

export type CorrectionValueGetter<T> = (origin: T) => Partial<RecordCorrectionValues>;

export function getCorrectionValues<T>(
  origin: T,
  reasons: RecordCorrectionReason[],
  valueGetters: Record<RecordCorrectionReason, CorrectionValueGetter<T>>,
): RecordCorrectionValues {
  const emptyValues: Partial<RecordCorrectionValues> = {};

  const correctionValues = reasons.reduce((values, reason) => ({ ...values, ...valueGetters[reason](origin) }), emptyValues);

  return {
    feesPaidToUkefForThePeriod: correctionValues.feesPaidToUkefForThePeriod ?? null,
    feesPaidToUkefForThePeriodCurrency: correctionValues.feesPaidToUkefForThePeriodCurrency ?? null,
    facilityId: correctionValues.facilityId ?? null,
    facilityUtilisation: correctionValues.facilityUtilisation ?? null,
  };
}
