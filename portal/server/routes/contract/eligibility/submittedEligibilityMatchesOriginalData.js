const { formDataMatchesOriginalData } = require('../formDataMatchesOriginalData');

const flattenOriginalData = (originalData, answers) => {
  const flattened = {
    ...originalData,
    ...answers,
  };

  // remove criteria array as the answers are now in strings.
  delete flattened.criteria;

  // remove status and validationErrors since these are not submitted values.
  delete flattened.status;
  delete flattened.validationErrors;

  return flattened;
};

const originalCriteriaAnswersAsStrings = (criteria) => {
  const result = {};

  criteria.forEach((c) => {
    if (typeof c.answer === 'boolean' && String(c.answer).length) {
      result[`criterion-${c.id}`] = String(c.answer);
    }
  });
  return result;
};

// flatten the original data we need into simple object
// check if this object has any differences against api data.
const submittedEligibilityMatchesOriginalData = (formData, originalData) => {
  const flattenedOriginalData = flattenOriginalData(originalData, originalCriteriaAnswersAsStrings(originalData.criteria));

  if (formDataMatchesOriginalData(formData, flattenedOriginalData)) {
    return true;
  }
  return false;
};

module.exports = {
  submittedEligibilityMatchesOriginalData,
  originalCriteriaAnswersAsStrings,
  flattenOriginalData,
};
