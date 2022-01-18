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
    ...submittedFilters
  } = allSubmittedFilters;

  const consistentArray = [];

  const filtersArray = Object.keys(submittedFilters);

  if (filtersArray.length) {
    filtersArray.forEach((field) => {
      const submittedValue = submittedFilters[field];
      const fieldHasMultipleValues = Array.isArray(submittedValue);

      if (submittedValue) {
        if (fieldHasMultipleValues) {
          consistentArray.push(
            { [field]: [...submittedValue] },
          );
        } else {
          consistentArray.push(
            { [field]: [submittedValue] },
          );
        }
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

/**
 * Replace some special characters in a string.
 * - White space and forward slash replaced with a dash.
 * - Single quotes are removed.
 * This is used in HTML for HREF's and data-cy
 *
 * @param {string} string
 * @example 'BSS/EWCS'
 * @returns 'BSS-EWCS'
 * @example 'Ready for Checker's approval'
 * @returns 'Ready-for-Checkers-approval'
 */
const formatFieldValue = (fieldValue) => {
  if (fieldValue) {
    return fieldValue.replace(/[\s/]/g, '-').replace('\'', '');
  }

  return null;
};

module.exports = {
  submittedFiltersArray,
  submittedFiltersObject,
  formatFieldValue,
};
