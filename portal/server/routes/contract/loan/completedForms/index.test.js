import completedLoanForms from '.';
import FIELDS from '../pageFields';
import { isCompleted } from '../../../../helpers/formCompleted';

describe('completedLoanForms', () => {
  it("should return an object with each loan page/form's completed status", () => {
    const mockValidationErrors = {
      errorList: {
        facilityStage: { text: 'Field is required' },
      },
    };

    const result = completedLoanForms(mockValidationErrors, FIELDS);

    expect(result).toEqual({
      loanGuaranteeDetails: isCompleted(mockValidationErrors, FIELDS.GUARANTEE_DETAILS),
      loanFinancialDetails: isCompleted(mockValidationErrors, FIELDS.FINANCIAL_DETAILS),
      loanDatesRepayments: isCompleted(mockValidationErrors, FIELDS.DATES_REPAYMENTS),
    });
  });
});
