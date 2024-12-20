import { CURRENCY, CurrencyAndAmount, getFormattedCurrencyAndAmount, mapReasonToDisplayValue, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { mapToCorrectionRequestDetailsViewModel } from './helpers';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';

describe('provide-utilisation-report-correction helpers', () => {
  describe('mapToCorrectionRequestDetailsViewModel', () => {
    it('should return an object containing the fee record correction facility id', () => {
      // Arrange
      const facilityId = '7';

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        facilityId,
      };

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.facilityId).toEqual(facilityId);
    });

    it('should return an object containing the fee record correction exporter', () => {
      // Arrange
      const exporter = 'A sample exporter.';

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        exporter,
      };

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.exporter).toEqual(exporter);
    });

    it('should return an object containing the fee record correction reported fees', () => {
      // Arrange
      const reportedFees: CurrencyAndAmount = {
        currency: CURRENCY.GBP,
        amount: 7,
      };

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        reportedFees,
      };

      const expectedFormattedReportedFees = getFormattedCurrencyAndAmount(reportedFees);

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.formattedReportedFees).toEqual(expectedFormattedReportedFees);
    });

    it('should return an object containing the fee record correction reasons', () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        reasons,
      };

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.reasons).toEqual(reasons);
    });

    it('should return an object containing the fee record correction formatted reasons', () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        reasons,
      };

      const expectedFormattedReasons = `${mapReasonToDisplayValue(reasons[0])}, ${mapReasonToDisplayValue(reasons[1])}`;

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.formattedReasons).toEqual(expectedFormattedReasons);
    });

    it('should return an object containing the fee record correction additional info', () => {
      // Arrange
      const additionalInfo = 'Some additional info.';

      const correctionResponse: GetFeeRecordCorrectionResponseBody = {
        ...aGetFeeRecordCorrectionResponseBody(),
        additionalInfo,
      };

      // Act
      const response = mapToCorrectionRequestDetailsViewModel(correctionResponse);

      // Assert
      expect(response.additionalInfo).toEqual(additionalInfo);
    });
  });
});
