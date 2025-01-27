import { CorrectionValuesPartialEntity, getFormattedMonetaryValue, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { validateRequiredCorrectionField } from '../../../../../../helpers';

/**
 * Gets a formatted string value for a given correction reason from the correction values.
 *
 * @remarks
 *
 * No validation is performed for the {@link RECORD_CORRECTION_REASON.OTHER}
 * reason as this value is not stored on the entity object. However, it still
 * needs to be included in the formatted string output with a '-' placeholder
 * so that the {@link RECORD_CORRECTION_REASON.OTHER} reference in the
 * 'reasons' column has a corresponding value.
 *
 * @param {CorrectionValuesPartialEntity} correctionValues - The correction values entity.
 * @param {RecordCorrectionReason} reason - The correction reason to get the formatted value for.
 * @returns {string} The formatted value for the correction reason.
 * @throws {Error} If the correction reason is unknown.
 * @throws {Error} If a required correction value is missing for the given reason.
 */
export const getFormattedCorrectionValueForCorrectionReason = (correctionValues: CorrectionValuesPartialEntity, reason: RecordCorrectionReason): string => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      validateRequiredCorrectionField(correctionValues.facilityId, reason);

      return correctionValues.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      validateRequiredCorrectionField(correctionValues.feesPaidToUkefForThePeriodCurrency, reason);

      return correctionValues.feesPaidToUkefForThePeriodCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      validateRequiredCorrectionField(correctionValues.feesPaidToUkefForThePeriod, reason);

      return getFormattedMonetaryValue(correctionValues.feesPaidToUkefForThePeriod);
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      validateRequiredCorrectionField(correctionValues.facilityUtilisation, reason);

      return getFormattedMonetaryValue(correctionValues.facilityUtilisation);
    case RECORD_CORRECTION_REASON.OTHER:
      return '-';
    default:
      throw new Error('Unknown correction reason');
  }
};

/**
 * Maps an array of correction reasons and their corresponding values to an array of formatted string values.
 * @param {RecordCorrectionReason[]} reasons - Array of correction reasons to map.
 * @param {CorrectionValuesPartialEntity} correctionValues - The correction values.
 * @returns {string} An array of formatted correction values.
 */
export const mapCorrectionReasonsAndValuesToFormattedValues = (reasons: RecordCorrectionReason[], correctionValues: CorrectionValuesPartialEntity): string[] =>
  reasons.map((reason) => getFormattedCorrectionValueForCorrectionReason(correctionValues, reason));
