import { anEmptyRecordCorrectionTransientFormData } from '@ukef/dtfs2-common/test-helpers';
import {
  CURRENCY,
  CurrencyAndAmount,
  getFormattedCurrencyAndAmount,
  getFormattedMonetaryValue,
  getMonetaryValueAsNumber,
  mapReasonToDisplayValue,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
  RecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import {
  getAdditionalCommentsFieldLabels,
  mapToProvideCorrectionFormValuesViewModel,
  mapToCorrectionRequestDetailsViewModel,
  optionalAdditionalCommentsFieldLabels,
  requiredAdditionalCommentsFieldLabelsForManyReasons,
  requiredAdditionalCommentsFieldLabelsForSingleReason,
  mapInputValueToFormattedMonetaryValueOrOriginal,
} from './helpers';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { CorrectionRequestDetailsViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

describe('provide-utilisation-report-correction helpers', () => {
  describe('mapToCorrectionRequestDetailsViewModel', () => {
    it('should return an object containing the correction request details', () => {
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

  describe('getAdditionalCommentsFieldLabels', () => {
    describe(`when the only fee record correction reason is '${RECORD_CORRECTION_REASON.OTHER}'`, () => {
      it('should return the "required" additional info field labels for a single reason', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        // Act
        const result = getAdditionalCommentsFieldLabels(reasons);

        // Assert
        expect(result).toEqual(requiredAdditionalCommentsFieldLabelsForSingleReason);
      });
    });

    describe(`when the only fee record correction reason is not '${RECORD_CORRECTION_REASON.OTHER}'`, () => {
      it('should return the "optional" additional info field labels', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

        // Act
        const result = getAdditionalCommentsFieldLabels(reasons);

        // Assert
        expect(result).toEqual(optionalAdditionalCommentsFieldLabels);
      });
    });

    describe(`when the fee record correction has multiple reasons including '${RECORD_CORRECTION_REASON.OTHER}'`, () => {
      it('should return the "required" additional info field labels for multiple reasons', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

        // Act
        const result = getAdditionalCommentsFieldLabels(reasons);

        // Assert
        expect(result).toEqual(requiredAdditionalCommentsFieldLabelsForManyReasons);
      });
    });

    describe(`when the fee record correction has multiple reasons not including '${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return the "optional" additional info field labels', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

        // Act
        const result = getAdditionalCommentsFieldLabels(reasons);

        // Assert
        expect(result).toEqual(optionalAdditionalCommentsFieldLabels);
      });
    });

    describe('when the fee record correction has no reasons', () => {
      it('should throw an error', () => {
        // Arrange
        const reasons: RecordCorrectionReason[] = [];

        // Assert
        expect(() => getAdditionalCommentsFieldLabels(reasons)).toThrow('Corrections must have at least one reason');
      });
    });
  });

  describe('mapInputValueToFormattedMonetaryValueOrOriginal', () => {
    it('should return null when monetary value is undefined', () => {
      // Arrange
      const monetaryValue = undefined;

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toBeNull();
    });

    it('should return null when monetary value is null', () => {
      // Arrange
      const monetaryValue = null;

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toBeNull();
    });

    it('should return formatted monetary value when value is a number', () => {
      // Arrange
      const monetaryValue = 1234.56;

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toEqual('1,234.56');
    });

    it('should return original string when value is a monetary value but is a string', () => {
      // Arrange
      const monetaryValue = '1234.56';

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toEqual(monetaryValue);
    });

    it('should return original string when value is invalid monetary value', () => {
      // Arrange
      const monetaryValue = 'INVALID';

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toEqual('INVALID');
    });

    it('should format the number zero correctly', () => {
      // Arrange
      const monetaryValue = 0;

      // Act
      const mappedValue = mapInputValueToFormattedMonetaryValueOrOriginal(monetaryValue);

      // Assert
      expect(mappedValue).toEqual('0.00');
    });
  });

  describe('mapToProvideCorrectionFormValuesViewModel', () => {
    it('should map facilityId without changing the value when provided', () => {
      // Arrange
      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        facilityId: '123',
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.facilityId).toEqual(savedFormValues.facilityId);
    });

    it('should set facilityId to null if not provided', () => {
      // Arrange
      const savedFormValues = {};

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.facilityId).toBeNull();
    });

    it('should map numeric utilisation to formatted monetary string when non-zero', () => {
      // Arrange
      const utilisation = 1234.56;

      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        utilisation,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.utilisation).toEqual(getFormattedMonetaryValue(utilisation));
    });

    it('should map string utilisation to formatted monetary string when non-zero', () => {
      // Arrange
      const savedFormValues = {
        utilisation: '1,234.56',
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      const expectedUtilisation = getFormattedMonetaryValue(getMonetaryValueAsNumber(savedFormValues.utilisation));

      expect(result.utilisation).toEqual(expectedUtilisation);
    });

    it('should map numeric utilisation to formatted monetary string when zero', () => {
      // Arrange
      const utilisation = 0;

      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        utilisation,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.utilisation).toEqual(getFormattedMonetaryValue(utilisation));
    });

    it('should set utilisation to null if not provided', () => {
      // Arrange
      const savedFormValues = {};

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.utilisation).toBeNull();
    });

    it('should map reportedFee to formatted monetary string when non-zero', () => {
      // Arrange
      const reportedFee = 1234.56;

      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        reportedFee,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.reportedFee).toEqual(getFormattedMonetaryValue(reportedFee));
    });

    it('should map reportedFee to formatted monetary string when zero', () => {
      // Arrange
      const reportedFee = 0;

      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        reportedFee,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.reportedFee).toEqual(getFormattedMonetaryValue(reportedFee));
    });

    it('should set reportedFee to null if not provided', () => {
      // Arrange
      const savedFormValues = {};

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.reportedFee).toBeNull();
    });

    it('should set additionalComments to null if not provided', () => {
      // Arrange
      const savedFormValues = {};

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.additionalComments).toBeNull();
    });

    it('should map additionalComments without changing the value when provided', () => {
      // Arrange
      const savedFormValues = {
        additionalComments: 'Some additional comments.',
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result.additionalComments).toEqual(savedFormValues.additionalComments);
    });

    it('should map all provided fields', () => {
      // Arrange
      const utilisation = 1234.56;
      const reportedFee = 9876.54;

      const savedFormValues: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        facilityId: '123',
        utilisation,
        reportedFee,
        additionalComments: 'Some additional comments.',
      };

      const expected = {
        facilityId: savedFormValues.facilityId,
        utilisation: getFormattedMonetaryValue(utilisation),
        reportedFee: getFormattedMonetaryValue(reportedFee),
        additionalComments: savedFormValues.additionalComments,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should ignore reported currency', () => {
      // Arrange
      const savedFormValues = {
        reportedCurrency: CURRENCY.GBP,
      };

      const expected = {
        facilityId: null,
        utilisation: null,
        reportedFee: null,
        additionalComments: null,
      };

      // Act
      const result = mapToProvideCorrectionFormValuesViewModel(savedFormValues);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
