import {
  REQUIRED_FIELDS,
  mapBondDetailsValidationErrors,
  mapBondFinancialDetailsValidationErrors,
  mapBondFeeDetailsValidationErrors,
} from './bond';

describe('bond validation errors mapping', () => {
  const mockBondErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('mapBondDetailsValidationErrors', () => {
    it('should only return `bond details` specific errors in errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.DETAILS[1]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = mapBondDetailsValidationErrors(mockValidationErrors);

      const expected = {
        [REQUIRED_FIELDS.DETAILS[0]]: mockErrorList[REQUIRED_FIELDS.DETAILS[0]],
        [REQUIRED_FIELDS.DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.DETAILS[1]],
      };
      expect(result.errorList).toEqual(expected);
    });
  });

  describe('mapBondFinancialDetailsValidationErrors', () => {
    it('should only return `bond details` specific errors in errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = mapBondFinancialDetailsValidationErrors(mockValidationErrors);

      const expected = {
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[0]]: mockErrorList[REQUIRED_FIELDS.FINANCIAL_DETAILS[0]],
        [REQUIRED_FIELDS.FINANCIAL_DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.FINANCIAL_DETAILS[1]],
      };
      expect(result.errorList).toEqual(expected);
    });
  });

  describe('mapBondFeeDetailsValidationErrors', () => {
    it('should only return `bond details` specific errors in errorList', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: { order: '3', text: 'Field is required' },
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = mapBondFeeDetailsValidationErrors(mockValidationErrors);

      const expected = {
        [REQUIRED_FIELDS.FEE_DETAILS[0]]: mockErrorList[REQUIRED_FIELDS.FEE_DETAILS[0]],
        [REQUIRED_FIELDS.FEE_DETAILS[1]]: mockErrorList[REQUIRED_FIELDS.FEE_DETAILS[1]],
      };
      expect(result.errorList).toEqual(expected);
    });
  });
});
