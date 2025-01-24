import { RecordCorrectionReason, RecordCorrectionValues } from '@ukef/dtfs2-common';

export type CorrectionValueGetter<T> = (origin: T) => Partial<RecordCorrectionValues>;

/**
 * Extracts record correcton values from a provided origin using passed in value getters.
 *
 * The value getters each return a partial RecordCorrectionValues object, and the values
 * are merged together and any undefined fields filled with null values.
 *
 * @param origin - the object that the correction values are to be extracted from
 * @param reasons - the reasons for the record correction
 * @param valueGetters - the value getters to extract the correction values
 * @returns the correction values
 */
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
