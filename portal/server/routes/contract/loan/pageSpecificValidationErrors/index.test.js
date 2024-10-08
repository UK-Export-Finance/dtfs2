import {
  loanGuaranteeDetailsValidationErrors,
  loanFinancialDetailsValidationErrors,
  loanDatesRepaymentsValidationErrors,
  loanPreviewValidationErrors,
} from '.';
import FIELDS from '../pageFields';
import { pageSpecificValidationErrors } from '../../../../helpers/pageSpecificValidationErrors';

describe('loan page specific validation errors', () => {
  const mockLoanErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('loanGuaranteeDetailsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockLoanErrors,
        [FIELDS.GUARANTEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockLoan = { _id: '1234', status: 'Incomplete' };

      const result = loanGuaranteeDetailsValidationErrors(mockValidationErrors, mockLoan);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.GUARANTEE_DETAILS, mockLoan);
      expect(result).toEqual(expected);
    });
  });

  describe('loanFinancialDetailsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockLoanErrors,
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockLoan = { _id: '1234', status: 'Incomplete' };

      const result = loanFinancialDetailsValidationErrors(mockValidationErrors, mockLoan);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FINANCIAL_DETAILS, mockLoan);
      expect(result).toEqual(expected);
    });
  });

  describe('loanDatesRepaymentsValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockLoanErrors,
        [FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockLoan = { _id: '1234', status: 'Incomplete' };

      const result = loanDatesRepaymentsValidationErrors(mockValidationErrors, mockLoan);

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.DATES_REPAYMENTS, mockLoan);
      expect(result).toEqual(expected);
    });
  });

  describe('loanPreviewValidationErrors', () => {
    it('should add `hrefRoot` to each required field error with link to relevant page', () => {
      const mockErrorList = {
        [FIELDS.GUARANTEE_DETAILS.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: { order: '2', text: 'Field is required' },
        [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[1]]: { order: '3', text: 'Field is required' },
        [FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS[0]]: { order: '4', text: 'Field is required' },
        [FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS[1]]: { order: '5', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockDealId = '123';
      const mockLoanId = '456';

      const result = loanPreviewValidationErrors(mockValidationErrors, mockDealId, mockLoanId);

      const expected = {
        errorList: {
          [FIELDS.GUARANTEE_DETAILS.REQUIRED_FIELDS[0]]: {
            order: '1',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/loan/${mockLoanId}/guarantee-details`,
          },
          [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[0]]: {
            order: '2',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/loan/${mockLoanId}/financial-details`,
          },
          [FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS[1]]: {
            order: '3',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/loan/${mockLoanId}/financial-details`,
          },
          [FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS[0]]: {
            order: '4',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/loan/${mockLoanId}/dates-repayments`,
          },
          [FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS[1]]: {
            order: '5',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/loan/${mockLoanId}/dates-repayments`,
          },
        },
        count: mockErrorList.length,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no validationErrors.errorList passed', () => {
      it('should return validationErrors object', () => {
        const mockValidationErrors = {};
        const result = loanPreviewValidationErrors(mockValidationErrors);
        expect(result).toEqual(mockValidationErrors);
      });
    });
  });
});
