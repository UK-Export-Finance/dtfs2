import bondCompletedStatus from './bond';
import FIELDS from '../pageFields/bond';
import isCompleted from '../../../helpers/pageCompletedStatus';

describe('bondCompletedStatus', () => {
  it('should return an object with each bond page/form\'s completed status', () => {
    const mockValidationErrors = {
      errorList: {
        bondType: { text: 'Field is required' },
        bondStage: { text: 'Field is required' },
      },
    };

    const result = bondCompletedStatus(mockValidationErrors, FIELDS);

    expect(result).toEqual({
      bondDetails: isCompleted(mockValidationErrors, FIELDS.DETAILS),
      bondFinancialDetails: isCompleted(mockValidationErrors, FIELDS.FINANCIAL_DETAILS),
      bondFeeDetails: isCompleted(mockValidationErrors, FIELDS.FEE_DETAILS),
    });
  });
});
