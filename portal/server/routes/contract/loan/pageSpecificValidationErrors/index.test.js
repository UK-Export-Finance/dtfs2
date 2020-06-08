import {
  loanGuaranteeDetailsValidationErrors,
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
});
