import { getFormattedCurrencyAndAmount, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { CorrectionRequestDetailsViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

/**
 * Maps the correction response to a correction request view model.
 * @param correctionResponse - The response body containing the correction details.
 * @returns The view model representing the correction request.
 */
export const mapToCorrectionRequestDetailsViewModel = (correctionResponse: GetFeeRecordCorrectionResponseBody): CorrectionRequestDetailsViewModel => ({
  facilityId: correctionResponse.facilityId,
  exporter: correctionResponse.exporter,
  formattedReportedFees: getFormattedCurrencyAndAmount(correctionResponse.reportedFees),
  reasons: correctionResponse.reasons,
  formattedReasons: mapReasonsToDisplayValues(correctionResponse.reasons).join(', '),
  additionalInfo: correctionResponse.additionalInfo,
});
