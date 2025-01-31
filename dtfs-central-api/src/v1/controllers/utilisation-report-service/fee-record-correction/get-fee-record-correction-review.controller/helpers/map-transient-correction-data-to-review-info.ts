import { FeeRecordCorrectionEntity, FeeRecordCorrectionReviewInformation, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';
import { mapFormDataToFormattedValues } from './map-form-data-values';

/**
 * Maps transient form data and fee record correction entity into review information.
 * @param formData - The transient form data containing the corrected values
 * @param feeRecordCorrection - The fee record correction entity containing original record and correction details
 * @returns Formatted review information
 */
export const mapTransientCorrectionDataToReviewInformation = (
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

  const formattedOldValues = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, reasons).join(', ');
  const formattedNewValues = mapFormDataToFormattedValues(formData, reasons).join(', ');

  return {
    correctionId,
    feeRecord: mappedFeeRecord,
    reasons,
    errorSummary,
    formattedOldValues,
    formattedNewValues,
    bankCommentary: formData.additionalComments,
  };
};
