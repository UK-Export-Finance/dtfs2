import FIELDS from '@ukef/portal-ui/server/routes/contract/eligibility/pageFields';
import { isCompleted } from '@ukef/portal-ui/server/helpers/formCompleted';
import completedEligibilityForms from '.';

describe('completedEligibilityForms', () => {
  it("should return an object with each eligibility page/form's completed status", () => {
    const mockStatus = 'Incomplete';

    const mockValidationErrors = {
      errorList: {
        17: { text: 'Field is required' },
        exporterQuestionnaire: { text: 'Field is required' },
      },
    };

    const result = completedEligibilityForms(mockStatus, mockValidationErrors, FIELDS);

    expect(result).toEqual({
      eligibilityCriteria: isCompleted(mockValidationErrors, FIELDS.ELIGIBILITY_CRITERIA),
      supportingDocumentation: isCompleted(mockValidationErrors, FIELDS.SUPPORTING_DOCUMENTATION),
    });
  });

  it('should return false when eligibility status is `Not started`', () => {
    const mockStatus = 'Not started';

    const mockValidationErrors = {};

    const result = completedEligibilityForms(mockStatus, mockValidationErrors, FIELDS);

    expect(result).toEqual({
      eligibilityCriteria: false,
      supportingDocumentation: false,
    });
  });
});
