/**
 * Transforms an object of submitted filters into a consistent array of objects.
 * If a submitted filter has just one string value, wrap into an array.
 *
 * @param {object} all submitted filters
 * @example { fieldA: 'value', fieldB: ['a', 'b'] }
 * @returns [ { fieldA: ['value'] }, { fieldB: ['a', 'b'] } ]
 */
const submittedFiltersArray = (allSubmittedFilters) => {
  const {
    createdByYou,
    keyword,
    ...submittedFilters
  } = allSubmittedFilters;

  const consistentArray = [];

  const filtersArray = Object.keys(submittedFilters);

  if (filtersArray.length) {
    filtersArray.forEach((field) => {
      const submittedValue = submittedFilters[field];
      const fieldHasMultipleValues = Array.isArray(submittedValue);

      if (fieldHasMultipleValues) {
        consistentArray.push(
          { [field]: [...submittedValue] },
        );
      } else {
        consistentArray.push(
          { [field]: [submittedValue] },
        );
      }
    });
  }

  return consistentArray;
};

/**
 * Transforms an array of objects into an object.
 * Each field becomes a child object.
 *
 * @param {array} array of filter objects
 * @example [ { submissionType: ['Automatic', 'Manual'] }, { dealType: ['GEF'] } ]
 * @returns { submissionType: ['Automatic', 'Manual'], dealType: ['GEF'] }
 */
const submittedFiltersObject = (filtersArray) => {
  const obj = {};

  filtersArray.forEach((filterObj) => {
    const fieldName = Object.keys(filterObj)[0];

    obj[fieldName] = filterObj[fieldName];
  });

  return obj;
};

module.exports = {
  submittedFiltersArray,
  submittedFiltersObject,
};
