import { mapValidationErrorsToViewModel } from './validation-errors-map-helper';

describe('validation-errors-map-helper', () => {
  describe('mapValidationErrorsToViewModel', () => {
    it('should map validation errors to view model with empty error summary when no errors exist', () => {
      // Arrange
      const validationErrors = {};

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      expect(mappedValidationErrors).toEqual({
        errorSummary: [],
      });
    });

    it('should map "facilityId" validation error to view model', () => {
      // Arrange
      const facilityIdErrorMessage = 'Invalid facility ID';
      const validationErrors = {
        facilityIdErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      const expectedMappedValidationErrors = {
        ...validationErrors,
        errorSummary: [
          {
            text: facilityIdErrorMessage,
            href: '#facilityId',
          },
        ],
      };

      expect(mappedValidationErrors).toEqual(expectedMappedValidationErrors);
    });

    it('should map "reportedCurrency" validation error to view model', () => {
      // Arrange
      const reportedCurrencyErrorMessage = 'Invalid currency';
      const validationErrors = {
        reportedCurrencyErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      const expectedMappedValidationErrors = {
        ...validationErrors,
        errorSummary: [
          {
            text: reportedCurrencyErrorMessage,
            href: '#reportedCurrency',
          },
        ],
      };

      expect(mappedValidationErrors).toEqual(expectedMappedValidationErrors);
    });

    it('should map "reportedFee" validation error to view model', () => {
      // Arrange
      const reportedFeeErrorMessage = 'Invalid reported fee';
      const validationErrors = {
        reportedFeeErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      const expectedMappedValidationErrors = {
        ...validationErrors,
        errorSummary: [
          {
            text: reportedFeeErrorMessage,
            href: '#reportedFee',
          },
        ],
      };

      expect(mappedValidationErrors).toEqual(expectedMappedValidationErrors);
    });

    it('should map "utilisation" validation error to view model', () => {
      // Arrange
      const utilisationErrorMessage = 'Invalid utilisation';
      const validationErrors = {
        utilisationErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      const expectedMappedValidationErrors = {
        ...validationErrors,
        errorSummary: [
          {
            text: utilisationErrorMessage,
            href: '#utilisation',
          },
        ],
      };

      expect(mappedValidationErrors).toEqual(expectedMappedValidationErrors);
    });

    it('should map "additionalComments" validation error to view model', () => {
      // Arrange
      const additionalCommentsErrorMessage = 'Invalid comments';
      const validationErrors = {
        additionalCommentsErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      const expectedMappedValidationErrors = {
        ...validationErrors,
        errorSummary: [
          {
            text: additionalCommentsErrorMessage,
            href: '#additionalComments',
          },
        ],
      };

      expect(mappedValidationErrors).toEqual(expectedMappedValidationErrors);
    });

    it('should map multiple validation errors to view model', () => {
      // Arrange
      const facilityIdErrorMessage = 'Invalid facility ID';
      const reportedCurrencyErrorMessage = 'Invalid currency';
      const reportedFeeErrorMessage = 'Invalid reported fee';
      const utilisationErrorMessage = 'Invalid utilisation';
      const additionalCommentsErrorMessage = 'Invalid comments';

      const validationErrors = {
        facilityIdErrorMessage,
        reportedCurrencyErrorMessage,
        reportedFeeErrorMessage,
        utilisationErrorMessage,
        additionalCommentsErrorMessage,
      };

      // Act
      const mappedValidationErrors = mapValidationErrorsToViewModel(validationErrors);

      // Assert
      expect(mappedValidationErrors).toEqual({
        ...validationErrors,
        errorSummary: [
          {
            text: facilityIdErrorMessage,
            href: '#facilityId',
          },
          {
            text: reportedCurrencyErrorMessage,
            href: '#reportedCurrency',
          },
          {
            text: reportedFeeErrorMessage,
            href: '#reportedFee',
          },
          {
            text: utilisationErrorMessage,
            href: '#utilisation',
          },
          {
            text: additionalCommentsErrorMessage,
            href: '#additionalComments',
          },
        ],
      });
    });
  });
});
