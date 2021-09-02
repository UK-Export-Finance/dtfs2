import {
  pageSpecificValidationErrors,
  allFieldsArray,
  shouldReturnRequiredValidation,
  mapRequiredValidationErrors,
  hasSubmittedAlwaysShowErrorFields,
  mapAlwaysShowErrorFields,
  mapRequiredAndAlwaysShowErrorFields,
} from './pageSpecificValidationErrors';
import {
  requiredFieldsArray,
  filterErrorList,
} from './pageFields';
import errorHref from './errorHref';
import generateErrorSummary from './generateErrorSummary';
import FIELDS from '../routes/contract/bond/pageFields';
import ABOUT_CONTRACT_FIELDS from '../routes/contract/about/pageFields';

describe('page specific validation errors', () => {
  const mockErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('allFieldsArray', () => {
    it('should return REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS and OPTIONAL_FIELDS from given fields object', () => {
      const mockFields = {
        REQUIRED_FIELDS: ['a', 'b', 'c'],
        CONDITIONALLY_REQUIRED_FIELDS: ['d', 'e', 'f'],
        OPTIONAL_FIELDS: ['g', 'h', 'i'],
      };

      const result = allFieldsArray(mockFields);
      const expected = [
        ...mockFields.REQUIRED_FIELDS,
        ...mockFields.CONDITIONALLY_REQUIRED_FIELDS,
        ...mockFields.OPTIONAL_FIELDS,
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('shouldReturnRequiredValidation', () => {
    it('should return true when field values length is greater than 0', () => {
      const mockFields = { ...FIELDS.FEE_DETAILS };

      const mockFieldValues = {
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: 'Test',
      };

      const result = shouldReturnRequiredValidation(mockFields, mockFieldValues);
      expect(result).toEqual(true);
    });

    it('should return true when there is a fields.viewedPreviewPage is true', () => {
      const mockFields = { ...FIELDS.FEE_DETAILS };
      const mockFieldValues = {
        viewedPreviewPage: true,
      };

      const result = shouldReturnRequiredValidation(mockFields, mockFieldValues);
      expect(result).toEqual(true);
    });


    it('should return false when field values length is NOT greater than 0', () => {
      const mockFields = { ...FIELDS.FEE_DETAILS };

      const mockFieldValues = {};

      const result = shouldReturnRequiredValidation(mockFields, mockFieldValues);
      expect(result).toEqual(false);
    });
  });

  describe('mapRequiredValidationErrors', () => {
    it('should return errorList from errorSummary function with only validationErrors that are included in requiredFields', () => {
      const mockErrorList = {
        ...mockErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const expectedRequiredErrorList = filterErrorList(
        mockValidationErrors.errorList,
        requiredFieldsArray(FIELDS.FEE_DETAILS),
      );

      const result = mapRequiredValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);

      const expectedErrorList = generateErrorSummary(
        { errorList: expectedRequiredErrorList },
        errorHref,
      ).errorList;

      expect(result.errorList).toEqual(expectedErrorList);
    });

    it('should return summary and count from errorSummary with only validationErrors that are included in REQUIRED_FIELDS CONDITIONALLY_REQUIRED_FIELDS', () => {
      const mockFeeDetailsFields = {
        ...FIELDS.FEE_DETAILS,
        CONDITIONALLY_REQUIRED_FIELDS: [
          'a',
          'b',
        ],
      };

      const mockErrorList = {
        ...mockErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
        [mockFeeDetailsFields.CONDITIONALLY_REQUIRED_FIELDS[0]]: { order: '5', text: 'Field is required' },
        [mockFeeDetailsFields.CONDITIONALLY_REQUIRED_FIELDS[1]]: { order: '6', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };
      const expectedErrorList = {
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
        [mockFeeDetailsFields.CONDITIONALLY_REQUIRED_FIELDS[0]]: { order: '5', text: 'Field is required' },
        [mockFeeDetailsFields.CONDITIONALLY_REQUIRED_FIELDS[1]]: { order: '6', text: 'Field is required' },
      };

      const result = mapRequiredValidationErrors(mockValidationErrors, mockFeeDetailsFields);

      const expectedSummary = generateErrorSummary(
        { errorList: expectedErrorList },
        errorHref,
      ).summary;

      expect(result.summary).toEqual(expectedSummary);
      expect(result.count).toEqual(Object.keys(expectedErrorList).length);
    });
  });

  describe('hasSubmittedAlwaysShowErrorFields', () => {
    it('should return true when a submitted field is included in fields.ALWAYS_SHOW_ERROR_FIELDS array', () => {
      const mockSubmittedFields = {
        'supplier-companies-house-registration-number': 'abc',
      };

      const result = hasSubmittedAlwaysShowErrorFields(ABOUT_CONTRACT_FIELDS.SUPPLIER, mockSubmittedFields);
      expect(result).toEqual(true);
    });

    it('should return false when a submitted field is NOT included in fields.ALWAYS_SHOW_ERROR_FIELDS array', () => {
      const mockSubmittedFields = {
        test: 'abc',
      };

      const result = hasSubmittedAlwaysShowErrorFields(ABOUT_CONTRACT_FIELDS.SUPPLIER, mockSubmittedFields);
      expect(result).toEqual(false);
    });
  });

  describe('mapAlwaysShowErrorFields', () => {
    it('should return errorList from errorSummary function with only validationErrors for `alwaysShowError` fields', () => {
      const mockErrorList = {
        ...mockErrors,
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: { order: '1', text: 'Field error' },
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[1]]: { order: '2', text: 'Field error' },
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field error' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const expectedErrorList = filterErrorList(
        mockValidationErrors.errorList,
        ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS,
      );

      const result = mapAlwaysShowErrorFields(mockValidationErrors, ABOUT_CONTRACT_FIELDS.SUPPLIER);

      const expected = generateErrorSummary(
        { errorList: expectedErrorList },
        errorHref,
      ).errorList;

      expect(result.errorList).toEqual(expected);
    });
  });

  describe('mapRequiredAndAlwaysShowErrorFields', () => {
    it('should asdfiajsafswewerwerwrerdof', () => {
      const mockErrorList = {
        ...mockErrors,
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: { order: '1', text: 'Field error' },
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[1]]: { order: '2', text: 'Field error' },
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const fieldsThatShouldBeReturned = [
        ...ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS,
        ...ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS,
      ];

      const expectedErrorList = filterErrorList(
        mockValidationErrors.errorList,
        fieldsThatShouldBeReturned,
      );

      const result = mapRequiredAndAlwaysShowErrorFields(mockValidationErrors, ABOUT_CONTRACT_FIELDS.SUPPLIER);

      const expected = generateErrorSummary(
        { errorList: expectedErrorList },
        errorHref,
      ).errorList;

      expect(result.errorList).toEqual(expected);
    });
  });

  // todo update pageSpecificValidationErrors....

  describe('pageSpecificValidationErrors', () => {
    it('should return mapRequiredValidationErrors result', () => {
      const mockErrorList = {
        ...mockErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockSubmittedValues = {
        _id: '1234',
        status: 'Incomplete',
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: 'test',
      };

      const result = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS, mockSubmittedValues);
      const expected = mapRequiredValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result).toEqual(expected);
    });

    describe('when submittedValues contains an `always show error`, field', () => {
      it('should return mapRequiredAndAlwaysShowErrorFields result', () => {
        const mockErrorList = {
          ...mockErrors,
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: { order: '1', text: 'Field error' },
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[1]]: { order: '2', text: 'Field is required' },
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[2]]: { order: '3', text: 'Field is required' },
        };

        const mockValidationErrors = {
          errorList: mockErrorList,
          count: mockErrorList.length,
        };

        const mockSubmittedValues = {
          _id: '1234',
          status: 'Incomplete',
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: 'test',
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.REQUIRED_FIELDS[1]]: 'test',
        };

        const result = pageSpecificValidationErrors(
          mockValidationErrors,
          ABOUT_CONTRACT_FIELDS.SUPPLIER,
          mockSubmittedValues,
        );

        const expected = mapRequiredAndAlwaysShowErrorFields(mockValidationErrors, ABOUT_CONTRACT_FIELDS.SUPPLIER);
        expect(result).toEqual(expected);
      });
    });
    describe('when there are no `required` field errors, but `always show error` field errors from submitted values`', () => {
      it('should return mapAlwaysShowErrorFields result', () => {
        const mockErrorList = {
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: { order: '1', text: 'Field error' },
        };

        const mockValidationErrors = {
          errorList: mockErrorList,
          count: mockErrorList.length,
        };

        const mockSubmittedValues = {
          _id: '1234',
          status: 'Incomplete',
          [ABOUT_CONTRACT_FIELDS.SUPPLIER.ALWAYS_SHOW_ERROR_FIELDS[0]]: 'test',
        };

        const result = pageSpecificValidationErrors(
          mockValidationErrors,
          ABOUT_CONTRACT_FIELDS.SUPPLIER,
          mockSubmittedValues,
        );

        const expected = mapAlwaysShowErrorFields(mockValidationErrors, ABOUT_CONTRACT_FIELDS.SUPPLIER);
        expect(result).toEqual(expected);
      });
    });
  });
});
