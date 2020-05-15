import pageSpecificValidationErrors, {
  allFieldsArray,
  shouldReturnRequiredValidation,
  mapRequiredValidationErrors,
} from './pageSpecificValidationErrors';
import {
  requiredFieldsArray,
  filterErrorList,
} from './pageFields';
import errorHref from './errorHref';
import generateErrorSummary from './generateErrorSummary';
import FIELDS from '../routes/contract/pageFields/bond';

describe('page specific validation errors', () => {
  const mockBondErrors = {
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
        ...mockBondErrors,
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
        ...mockBondErrors,
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

    it('should return conditionalErrorList from validationErrors object', () => {
      const mockValidationErrors = {
        errorList: {},
        conditionalErrorList: {
          bondStage: {
            Unissued: {
              ukefGuaranteeInMonths: {
                text: 'Length of time that the UKEF\'s guarantee will be in place for is required',
              },
            },
            Issued: {
              coverEndDate: {
                text: 'Cover End Date is required',
              },
              uniqueIdentificationNumber: {
                text: 'Bond\'s unique identification number is required',
              },
            },
          },
        },
      };

      const result = mapRequiredValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result.conditionalErrorList).toEqual(mockValidationErrors.conditionalErrorList);
    });
  });

  describe('pageSpecificValidationErrors', () => {
    it('should return mapRequiredValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockBond = {
        _id: '1234',
        status: 'Incomplete',
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: 'test',
      };

      const result = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS, mockBond);
      const expected = mapRequiredValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result).toEqual(expected);
    });

    describe('when there is no errorList in validationErrors', () => {
      it('should only return validationErrors.conditionalErrorList', () => {
        const mockValidationErrors = {
          conditionalErrorList: {
            bondStage: {
              Unissued: {
                ukefGuaranteeInMonths: {
                  text: 'Length of time that the UKEF\'s guarantee will be in place for is required',
                },
              },
            },
          },
        };
        const result = pageSpecificValidationErrors(mockValidationErrors);
        expect(result).toEqual({
          conditionalErrorList: mockValidationErrors.conditionalErrorList,
        });
      });
    });
  });
});
