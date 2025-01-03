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
      const expectedErrorTypeHeader = 'Error types';

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
        errorTypeHeader: expectedErrorTypeHeader,
      });
    });

    describe('when there is only one reason', () => {
      it('should return singular error type header', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        const correctionResponse: GetFeeRecordCorrectionResponseBody = {
          ...aGetFeeRecordCorrectionResponseBody(),
          reasons,
        };

        const expectedErrorTypeHeader = 'Error type';

        // Act
        const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

        // Assert
        expect(response.errorTypeHeader).toEqual(expectedErrorTypeHeader);
      });
    });

    describe('when there is more than one reason', () => {
      it('should return plural error type header', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

        const correctionResponse: GetFeeRecordCorrectionResponseBody = {
          ...aGetFeeRecordCorrectionResponseBody(),
          reasons,
        };

        const expectedErrorTypeHeader = 'Error types';

        // Act
        const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

        // Assert
        expect(response.errorTypeHeader).toEqual(expectedErrorTypeHeader);
      });
    });
  });
});
