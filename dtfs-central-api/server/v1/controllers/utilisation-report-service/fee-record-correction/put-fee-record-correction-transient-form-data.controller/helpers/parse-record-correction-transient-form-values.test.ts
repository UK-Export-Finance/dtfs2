import { anEmptyRecordCorrectionTransientFormData } from "@ukef/dtfs2-common/test-helpers";
import { CURRENCY } from '@ukef/dtfs2-common';
import { parseValidatedRecordCorrectionTransientFormValues } from './parse-record-correction-transient-form-values';

describe('parse-record-correction-transient-form-values', () => {
  describe('parseValidatedRecordCorrectionTransientFormValues', () => {
    it('should parse all form values when values for all fields are provided', () => {
      // Arrange
      const formValues = {
        utilisation: '123.45',
        reportedCurrency: CURRENCY.USD,
        reportedFee: '7.77',
        facilityId: '12345678',
        additionalComments: 'An additional comment',
      };

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      const expectedParsedFormValues = {
        utilisation: 123.45,
        reportedCurrency: CURRENCY.USD,
        reportedFee: 7.77,
        facilityId: '12345678',
        additionalComments: 'An additional comment',
      };

      expect(parsedFormValues).toEqual(expectedParsedFormValues);
    });

    it('should parse all provided form values when only values for some fields are provided', () => {
      // Arrange
      const formValues = {
        utilisation: '123.45',
        reportedCurrency: CURRENCY.EUR,
      };

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      const expectedParsedFormValues = {
        ...anEmptyRecordCorrectionTransientFormData(),
        utilisation: 123.45,
        reportedCurrency: CURRENCY.EUR,
      };

      expect(parsedFormValues).toEqual(expectedParsedFormValues);
    });

    it('should convert monetary values with thousands separators to numbers', () => {
      // Arrange
      const formValues = {
        utilisation: '123,456.78',
        reportedCurrency: CURRENCY.USD,
        reportedFee: '76,543.21',
        facilityId: '12345678',
      };

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      const expectedParsedFormValues = {
        ...anEmptyRecordCorrectionTransientFormData(),
        utilisation: 123456.78,
        reportedCurrency: CURRENCY.USD,
        reportedFee: 76543.21,
        facilityId: '12345678',
      };

      expect(parsedFormValues).toEqual(expectedParsedFormValues);
    });

    it('should remove leading and trailing whitespace from "additionalComments"', () => {
      // Arrange
      const formValues = {
        additionalComments: '   A comment with whitespace   ',
      };

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      const expectedAdditionalComments = 'A comment with whitespace';

      expect(parsedFormValues.additionalComments).toEqual(expectedAdditionalComments);
    });

    it('should parse an empty "additional comments" string as null', () => {
      // Arrange
      const formValues = {
        additionalComments: '',
      };

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      expect(parsedFormValues.additionalComments).toBeNull();
    });

    it('should parse undefined form values as null', () => {
      // Arrange
      const formValues = {};

      // Act
      const parsedFormValues = parseValidatedRecordCorrectionTransientFormValues(formValues);

      // Assert
      const expectedParsedFormValues = anEmptyRecordCorrectionTransientFormData();

      expect(parsedFormValues).toEqual(expectedParsedFormValues);
    });
  });
});
