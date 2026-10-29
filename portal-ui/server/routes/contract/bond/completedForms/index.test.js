import FIELDS from '@ukef/portal-ui/server/routes/contract/bond/pageFields';
import { isCompleted } from '@ukef/portal-ui/server/helpers/formCompleted';
import completedBondForms from '.';

describe('completedBondForms', () => {
  it("should return an object with each bond page/form's completed status", () => {
    const mockValidationErrors = {
      errorList: {
        bondType: { text: 'Field is required' },
        facilityStage: { text: 'Field is required' },
      },
    };

    const result = completedBondForms(mockValidationErrors, FIELDS);

    expect(result).toEqual({
      bondDetails: isCompleted(mockValidationErrors, FIELDS.DETAILS),
      bondFinancialDetails: isCompleted(mockValidationErrors, FIELDS.FINANCIAL_DETAILS),
      bondFeeDetails: isCompleted(mockValidationErrors, FIELDS.FEE_DETAILS),
    });
  });
});
