import {
  REQUIRED_FIELDS,
  shouldReturnValidation,
  handleBondDetailsValidationErrors,
  handleBondFinancialDetailsValidationErrors,
  handleBondFeeDetailsValidationErrors,
  handleBondPreviewValidationErrors,
} from './bond';

describe('bond validation errors mapping', () => {
  const mockBondErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('shouldReturnValidation', () => {
    it('should return true when errorsCount is less than fieldsCount', () => {
      const result = shouldReturnValidation(3, 4);
      expect(result).toEqual(true);
    });
  });

  describe('handleBondDetailsValidationErrors', () => {
    it('should return `details` specific errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.DETAILS[1]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondDetailsValidationErrors(mockValidationErrors);

      const expectedErrorList = {
        [REQUIRED_FIELDS.DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.DETAILS[1]],
      };
      expect(result.errorList).toEqual(expectedErrorList);
    });

    // it('should return an empty errorList object when errorsCount is the same as required fields count', () => {
    //   const mockErrorList = {
    //     [REQUIRED_FIELDS.DETAILS[0]]: { order: '3', text: 'Field is required' },
    //     [REQUIRED_FIELDS.DETAILS[1]]: { order: '4', text: 'Field is required' },
    //   };

    //   const mockValidationErrors = {
    //     errorList: mockErrorList,
    //     count: mockErrorList.length,
    //   };

    //   const result = handleBondDetailsValidationErrors(mockValidationErrors);
    //   expect(result.errorList).toEqual({});
    // });
  });

  describe('handleBondFinancialDetailsValidationErrors', () => {
    it('should only return `financial details` specific errors in errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: { order: '4', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[2]]: { order: '5', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFinancialDetailsValidationErrors(mockValidationErrors);

      const expected = {
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: mockErrorList[REQUIRED_FIELDS.FINANCIAL_DETAILS[0]],
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.FINANCIAL_DETAILS[1]],
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[2]]: mockErrorList[REQUIRED_FIELDS.FINANCIAL_DETAILS[2]],
      };
      expect(result.errorList).toEqual(expected);
    });

    it('should return an empty object when errorsCount is the same as required fields count', () => {
      const mockErrorList = {
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: { order: '4', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[2]]: { order: '5', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[3]]: { order: '6', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFinancialDetailsValidationErrors(mockValidationErrors);
      expect(result).toEqual({});
    });
  });

  describe('handleBondFeeDetailsValidationErrors', () => {
    it('should only return `fee details` specific errors in errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFeeDetailsValidationErrors(mockValidationErrors);

      const expected = {
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: mockErrorList[REQUIRED_FIELDS.FEE_DETAILS[0]],
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.FEE_DETAILS[1]],
      };
      expect(result.errorList).toEqual(expected);
    });

    it('should return an empty object when errorsCount is the same as required fields count', () => {
      const mockErrorList = {
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: { order: '4', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[2]]: { order: '5', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = handleBondFeeDetailsValidationErrors(mockValidationErrors);
      expect(result).toEqual({});
    });
  });

  describe('handleBondPreviewValidationErrors', () => {
    it('should add `hrefRoot` to each required field error with link to relevant page', () => {
      const mockErrorList = {
        [REQUIRED_FIELDS.DETAILS[0]]: { order: '1', text: 'Field is required' },
        [REQUIRED_FIELDS.DETAILS[1]]: { order: '2', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: { order: '4', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: { order: '5', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: { order: '6', text: 'Field is required' },
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
          [REQUIRED_FIELDS.DETAILS[0]]: {
            order: '1',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/details`,
          },
          [REQUIRED_FIELDS.DETAILS[1]]: {
            order: '2',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/details`,
          },
          [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: {
            order: '3',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/financial-details`,
          },
          [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: {
            order: '4',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/financial-details`,
          },
          [REQUIRED_FIELDS.FEE_DETAILS[0]]: {
            order: '5',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/fee-details`,
          },
          [REQUIRED_FIELDS.FEE_DETAILS[1]]: {
            order: '6',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/bond/${mockBondId}/fee-details`,
          },
        },
        count: mockErrorList.length,
      };

      expect(result).toEqual(expected);
    });
  });
});
