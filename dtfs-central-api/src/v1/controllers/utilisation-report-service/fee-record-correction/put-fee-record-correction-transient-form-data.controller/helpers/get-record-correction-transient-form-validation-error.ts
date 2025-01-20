import { RecordCorrectionReason, MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, isMonetaryValueValid, isCurrencyValid } from '@ukef/dtfs2-common';
import { UKEF_FACILITY_ID_REGEX } from '../../../../../../constants/regex';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';

/**
 * Validates a facility ID value.
 * @param facilityIdValue - The facility ID to validate.
 * @returns A promise that resolves to an error message if validation fails, undefined otherwise.
 * The error message will indicate if:
 * - The facility ID is missing or does not match the required format (8-10 digits)
 * - The facility ID does not correspond to an existing General Export Facility
 */
export const getFacilityIdValidationError = async (facilityIdValue?: string): Promise<string | undefined> => {
  if (!facilityIdValue || !UKEF_FACILITY_ID_REGEX.test(facilityIdValue)) {
    return 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
  }

  const ukefGefFacilityExists = await TfmFacilitiesRepo.ukefGefFacilityExists(facilityIdValue);

  if (!ukefGefFacilityExists) {
    return 'The facility ID entered has not been recognised, please enter a facility ID for a General Export Facility';
  }

  return undefined;
};

/**
 * Validates a reported currency value.
 * @param reportedCurrencyValue - The reported currency value to validate.
 * @returns An error message if validation fails, undefined otherwise.
 * The error message will indicate if the reported currency is missing or invalid.
 */
export const getReportedCurrencyValidationError = (reportedCurrencyValue?: string): string | undefined => {
  if (!isCurrencyValid(reportedCurrencyValue)) {
    return 'You must select a currency';
  }

  return undefined;
};

/**
 * Validates a reported fee value.
 * @param reportedFeeValue - The reported fee value to validate.
 * @returns An error message if validation fails, undefined otherwise.
 * The error message will indicate if the reported fee amount is missing or in an invalid format.
 */
export const getReportedFeeValidationError = (reportedFeeValue?: string): string | undefined => {
  if (!isMonetaryValueValid(reportedFeeValue)) {
    return 'You must enter the reported fee in a valid format';
  }

  return undefined;
};

/**
 * Validates a utilisation value.
 * @param utilisationValue - The utilisation value to validate.
 * @returns An error message if validation fails, undefined otherwise.
 * The error message will indicate if the utilisation is missing or in an invalid format.
 */
export const getUtilisationValidationError = (utilisationValue?: string): string | undefined => {
  if (!isMonetaryValueValid(utilisationValue)) {
    return 'You must enter the utilisation in a valid format';
  }

  return undefined;
};

/**
 * Validates the additional comments field for a record correction request.
 *
 * If the character count exceeds the maximum allowed character count of
 * {@link MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT}, the
 * input field referenced in the error message is matched to the fields label.
 *
 * @param correctionReasons - The reasons for the record correction request.
 * @param additionalComments - The additional comments text to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
export const getAdditionalCommentsValidationError = (correctionReasons: RecordCorrectionReason[], additionalComments?: string): string | undefined => {
  if (!additionalComments || !additionalComments.trim()) {
    return 'You must enter a comment';
  }

  if (additionalComments.length < MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT) {
    return undefined;
  }

  const baseCharacterLimitExceededErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the`;

  if (correctionReasons.length === 1) {
    return `${baseCharacterLimitExceededErrorMessage} record information box`;
  }

  return `${baseCharacterLimitExceededErrorMessage} additional comments box`;
};
