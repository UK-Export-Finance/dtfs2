import {
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionReviewInformation,
  FeeRecordEntity,
  RecordCorrectionTransientFormData,
  RecordCorrectionUpdatableFieldValues,
  RecordCorrectionUpdatableFieldValuesKey,
} from '@ukef/dtfs2-common';
import { pickBy } from 'lodash';

// TODO: Add TSDOC
const getUpdatedFieldKeys = (updatedFieldValues: RecordCorrectionUpdatableFieldValues): RecordCorrectionUpdatableFieldValuesKey[] => {
  const definedFieldKeys = Object.keys(pickBy(updatedFieldValues));

  return definedFieldKeys as RecordCorrectionUpdatableFieldValuesKey[];
};

// TODO: Add unit tests
// TODO: Add TSDOC, add detail about won't return undefined values
export const mapFormDataToNewValues = (formData: RecordCorrectionTransientFormData): RecordCorrectionUpdatableFieldValues => {
  const { utilisation, reportedCurrency, reportedFee, facilityId } = formData;

  return {
    utilisation,
    reportedCurrency,
    reportedFee,
    facilityId,
  };
};

// TODO: Add unit tests
// TODO: Add TSDOC
export const mapChangedFeeRecordFieldsToOldValues = (
  feeRecord: FeeRecordEntity,
  updatedFields: RecordCorrectionUpdatableFieldValuesKey[],
): RecordCorrectionUpdatableFieldValues => {
  const fieldMappings: RecordCorrectionUpdatableFieldValues = {
    utilisation: feeRecord.facilityUtilisation,
    // TODO: Check this is the right currency
    reportedCurrency: feeRecord.feesPaidToUkefForThePeriodCurrency,
    reportedFee: feeRecord.feesPaidToUkefForThePeriod,
    facilityId: feeRecord.facilityId,
  };

  return Object.fromEntries(updatedFields.map((field) => [field, fieldMappings[field]]));
};

// TODO: Add unit tests
// TODO: Add TSDOC
export const mapToReviewInformation = (
  formData: RecordCorrectionTransientFormData,
  feeRecordCorrection: FeeRecordCorrectionEntity,
): FeeRecordCorrectionReviewInformation => {
  const { id: correctionId, feeRecord, reasons, additionalInfo: errorSummary } = feeRecordCorrection;

  const mappedFeeRecord = {
    exporter: feeRecord.exporter,
    reportedFees: {
      currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
      amount: feeRecord.feesPaidToUkefForThePeriod,
    },
  };

  const newValues = mapFormDataToNewValues(formData);

  const updatedFieldKeys = getUpdatedFieldKeys(newValues);

  const oldValues = mapChangedFeeRecordFieldsToOldValues(feeRecord, updatedFieldKeys);

  return {
    correctionId,
    feeRecord: mappedFeeRecord,
    reasons,
    errorSummary,
    oldValues,
    newValues,
    bankCommentary: formData.additionalComments,
  };
};
