import FIELDS from '../pageFields';
import isCompleted from '../../../../helpers/formCompleted';

const completedEligibilityForms = (eligibilityStatus, validationErrors) => {
  if (eligibilityStatus === 'Not started') {
    return {
      eligibilityCriteria: false,
      supportingDocumentation: false,
    };
  }

  return {
    eligibilityCriteria: isCompleted(validationErrors, FIELDS.ELIGIBILITY_CRITERIA),
    supportingDocumentation: isCompleted(validationErrors, FIELDS.SUPPORTING_DOCUMENTATION),
  };
};


export default completedEligibilityForms;
