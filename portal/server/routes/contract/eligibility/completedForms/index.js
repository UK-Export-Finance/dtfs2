import FIELDS from '../pageFields';
import isCompleted from '../../../../helpers/formCompleted';

const completedEligibilityForms = (validationErrors) => ({
  eligibilityCriteria: isCompleted(validationErrors, FIELDS.ELIGIBILITY_CRITERIA),
  supportingDocumentation: isCompleted(validationErrors, FIELDS.SUPPORTING_DOCUMENTATION),
});

export default completedEligibilityForms;
