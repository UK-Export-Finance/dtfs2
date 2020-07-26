import formDataMatchesOriginalData from '../formDataMatchesOriginalData';

// flatten the original data we need into 1 level deep object
// check if this object has any differences against api data.
const submittedEligibilityMatchesOriginalData = (formData, originalData) => {
  const originalCriteriaAnswersAsStrings = () => {
    const result = {};

    originalData.criteria.forEach((c) => {
      if (typeof c.answer === 'boolean' && String(c.answer).length) {
        result[`criterion-${c.id}`] = String(c.answer);
      }
    });
    return result;
  };

  const flattenOriginalData = () => {
    const flattened = {
      ...originalData,
      ...originalCriteriaAnswersAsStrings(),
    };

    // remove criteria array as the answers are now in strings.
    delete flattened.criteria;

    // remove status and validationErrors since these are not submitted values.
    // TODO: ideally these should not be saved in the API and instead returned dynamically
    delete flattened.status;
    delete flattened.validationErrors;

    return flattened;
  };

  const flattenedOriginalData = flattenOriginalData();

  if (formDataMatchesOriginalData(formData, flattenedOriginalData)) {
    return true;
  }
  return false;
};


export default submittedEligibilityMatchesOriginalData;
