import {
  FIELDS,
  shouldReturnValidation,
  mapValidationErrors,
  handleValidationErrors,
  handleBondDetailsValidationErrors,
  handleBondFinancialDetailsValidationErrors,
  handleBondFeeDetailsValidationErrors,
  handleBondPreviewValidationErrors,
} from './bond';
import {
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

describe('bond validation errors mapping', () => {
  const mockBondErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('shouldReturnValidation', () => {
    it('should return true when errorsCount is less than requiredFields count', () => {
      const result = shouldReturnValidation(3, 4);
      expect(result).toEqual(true);
    });
  });

  describe('mapValidationErrors', () => {
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

      const expectedRequiredErrorList = {
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const result = mapValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);

      const expectedErrorList = generateErrorSummary(
        { errorList: expectedRequiredErrorList },
        errorHref,
      ).errorList;

      expect(result.errorList).toEqual(expectedErrorList);
    });

    it('should return summary and count from errorSummary with only validationErrors that are included in requiredFields', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const expectedRequiredErrorList = {
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const result = mapValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);

      const expectedSummary = generateErrorSummary(
        { errorList: expectedRequiredErrorList },
        errorHref,
      ).summary;

      expect(result.summary).toEqual(expectedSummary);
      expect(result.count).toEqual(Object.keys(expectedRequiredErrorList).length);
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

      const result = mapValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result.conditionalErrorList).toEqual(mockValidationErrors.conditionalErrorList);
    });

    describe('when there is no validationErrors object passed', () => {
      it('should use an empty object', () => {
        const result = mapValidationErrors(undefined, FIELDS.FEE_DETAILS);

        const expected = generateErrorSummary(
          {
            errorList: {},
          },
          errorHref,
        );

        expect(result).toEqual(expected);
      });
    });
  });

  describe('handleValidationErrors', () => {
    it('should return mapValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      const expected = mapValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result).toEqual(expected);
    });

    describe('when errorsCount is equal to/greater than the requiredFields count', () => {
      it('should return an empty object', () => {
        const mockErrorList = {
          [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
          [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '2', text: 'Field is required' },
          [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[2]]: { order: '3', text: 'Field is required' },
        };

        const mockValidationErrors = {
          errorList: mockErrorList,
          count: mockErrorList.length,
        };

        const result = handleValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
        expect(result).toEqual({});
      });
    });
  });

  describe('handleBondDetailsValidationErrors', () => {
    it('should return handleValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondDetailsValidationErrors(mockValidationErrors);

      const expected = handleValidationErrors(mockValidationErrors, FIELDS.DETAILS);
      expect(result).toEqual(expected);
    });
  });

  describe('handleBondFinancialDetailsValidationErrors', () => {
    it('should return handleValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFinancialDetailsValidationErrors(mockValidationErrors);

      const expected = handleValidationErrors(mockValidationErrors, FIELDS.FINANCIAL_DETAILS);
      expect(result).toEqual(expected);
    });
  });

  describe('handleBondFeeDetailsValidationErrors', () => {
    it('should return handleValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFeeDetailsValidationErrors(mockValidationErrors);

      const expected = handleValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS);
      expect(result).toEqual(expected);
    });
  });

  describe('handleBondPreviewValidationErrors', () => {
    it('should add `hrefRoot` to each required field error with link to relevant page', () => {
      const mockErrorList = {
        [FIELDS.DETAILS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
        [FIELDS.DETAILS.REQUIRED_FIELDS[1]]: { order: '2', text: 'Field is required' },
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[1]]: { order: '4', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '5', text: 'Field is required' },
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: { order: '6', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };


      const mockDealId = '123';
      const mockBondId = '456';

      const result = handleBondPreviewValidationErrors(
        mockValidationErrors,
        mockDealId,
        mockBondId,
      );

      const expected = {
        errorList: {
          [FIELDS.DETAILS.REQUIRED_FIELDS[0]]: {
            order: '1',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/details`,
          },
          [FIELDS.DETAILS.REQUIRED_FIELDS[1]]: {
            order: '2',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/details`,
          },
          [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: {
            order: '3',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/financial-details`,
          },
          [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[1]]: {
            order: '4',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/financial-details`,
          },
          [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: {
            order: '5',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/fee-details`,
          },
          [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[1]]: {
            order: '6',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/fee-details`,
          },
        },
        count: mockErrorList.length,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no validationErrors.errorList passed', () => {
      it('should return validationErrors object', () => {
        const mockValidationErrors = {};
        const result = handleBondPreviewValidationErrors(mockValidationErrors);
        expect(result).toEqual(mockValidationErrors);
      });
    });
  });
});
