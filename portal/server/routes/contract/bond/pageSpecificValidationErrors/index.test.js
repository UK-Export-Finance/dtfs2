import { bondDetailsValidationErrors, bondFinancialDetailsValidationErrors, bondFeeDetailsValidationErrors, bondPreviewValidationErrors } from '.';
import FIELDS from '../pageFields';
import { pageSpecificValidationErrors } from '../../../../helpers/pageSpecificValidationErrors';

describe('bond page specific validation errors', () => {
  const mockBondErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('bondDetailsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockBond = { _id: '1234', status: 'Incomplete' };

      const result = bondDetailsValidationErrors(mockValidationErrors, mockBond);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.DETAILS, mockBond);
      expect(result).toEqual(expected);
    });
  });

  describe('bondFinancialDetailsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockBond = { _id: '1234', status: 'Incomplete' };

      const result = bondFinancialDetailsValidationErrors(mockValidationErrors, mockBond);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FINANCIAL_DETAILS, mockBond);
      expect(result).toEqual(expected);
    });
  });

  describe('bondFeeDetailsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockBondErrors,
        [FIELDS.FEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockBond = { _id: '1234', status: 'Incomplete' };

      const result = bondFeeDetailsValidationErrors(mockValidationErrors, mockBond);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FEE_DETAILS, mockBond);
      expect(result).toEqual(expected);
    });
  });

  describe('bondPreviewValidationErrors', () => {
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

      const result = bondPreviewValidationErrors(mockValidationErrors, mockDealId, mockBondId);

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
        const result = bondPreviewValidationErrors(mockValidationErrors);
        expect(result).toEqual(mockValidationErrors);
      });
    });
  });
});
