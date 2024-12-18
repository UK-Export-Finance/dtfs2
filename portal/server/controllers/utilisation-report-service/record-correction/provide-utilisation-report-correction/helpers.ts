import { getFormattedCurrencyAndAmount, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { CorrectionRecordViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

// TODO FN-3668: Add TSDOC.
export const mapToCorrectionRecordViewModel = (correctionResponse: GetFeeRecordCorrectionResponseBody): CorrectionRecordViewModel => {
  return {
    facilityId: correctionResponse.facilityId,
    exporter: correctionResponse.exporter,
    reportedFees: getFormattedCurrencyAndAmount(correctionResponse.reportedFees),
    reasons: correctionResponse.reasons,
    formattedReasons: mapReasonsToDisplayValues(correctionResponse.reasons).join(', '),
    additionalInfo: correctionResponse.additionalInfo,
  };
};
