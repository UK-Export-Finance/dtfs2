import { CURRENCY, CurrencyAndAmount, getFormattedCurrencyAndAmount, mapReasonToDisplayValue, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { mapToCorrectionRequestDetailsViewModel } from './helpers';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { CorrectionRequestDetailsViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

describe('provide-utilisation-report-correction helpers', () => {
  describe('mapToCorrectionRequestDetailsViewModel', () => {
    it('should return an object containing the fee record correction facility id', () => {
      // Arrange
      const facilityId = '7';
      const exporter = 'A sample exporter.';
      const reportedFees: CurrencyAndAmount = {
        currency: CURRENCY.GBP,
        amount: 7,
      };
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];
      const additionalInfo = 'Some additional info.';

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        facilityId,
        exporter,
        reportedFees,
        reasons,
        additionalInfo,
      };

      const expectedFormattedReportedFees = getFormattedCurrencyAndAmount(reportedFees);
      const expectedFormattedReasons = `${mapReasonToDisplayValue(reasons[0])}, ${mapReasonToDisplayValue(reasons[1])}`;

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response).toEqual<CorrectionRequestDetailsViewModel>({
        facilityId,
        exporter,
        formattedReportedFees: expectedFormattedReportedFees,
        reasons,
        formattedReasons: expectedFormattedReasons,
        additionalInfo,
      });
    });
  });
});
