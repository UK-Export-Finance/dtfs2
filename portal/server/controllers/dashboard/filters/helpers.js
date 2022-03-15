/**
 * Transforms an object of submitted filters into a consistent array of objects.
 * If a submitted filter has just one string value, wrap into an array.
 *
 * @param {object} all submitted filters
 * @example { fieldA: 'value', fieldB: ['a', 'b'] }
 * @returns [ { fieldA: ['value'] }, { fieldB: ['a', 'b'] } ]
 */
const submittedFiltersArray = (allSubmittedFilters = {}) => {
  const submittedFilters = allSubmittedFilters;

  if (submittedFilters.createdByYou) {
    delete submittedFilters.createdByYou;
  }

  const consistentArray = [];

  const filtersArray = Object.keys(submittedFilters);

  if (filtersArray.length) {
    filtersArray.forEach((field) => {
      const submittedValue = submittedFilters[field];
      const fieldHasMultipleValues = Array.isArray(submittedValue);

      // NOTE: some filter values can have a value of false.
      if (submittedValue || submittedValue === false) {
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
  if (fieldValue || typeof fieldValue === 'boolean') {
    return String(fieldValue).replace(/[\s/]/g, '-').replace('\'', '');
  }

  return null;
};

/**
 * Creates aria-label for filters selected in text form.
 * - loops through nested arrays and adds necessary filters.
 * - 1st level - filter type.
 * - 2nd level - which filter is selected
 * - if no filters selected, then will return 'Filters selected: None'
 *
 * @param {Array} filters
 * @example 'BSS/EWCS'
 * @returns 'Filters selected: , Product: , BSS/EWCS, Notice Type: , Automatic Inclusion Notice, Status: , Draft'
 */
const filtersToText = (filters) => {
  let filterString = 'Filters selected: ';

  if (filters.length > 0) {
    /* eslint-disable no-restricted-syntax */
    for (const filter of filters) {
      // adds commas so read out with correct pauses
      filterString = filterString.concat(', ');
      filterString = filterString.concat(filter.heading.text);
      filterString = filterString.concat(': ');

      for (const item of filter.items) {
        // adds commas so read out with correct pauses
        filterString = filterString.concat(', ');
        filterString = filterString.concat(item.text);
      }
    }
  } else {
    // if no filters selected
    filterString = filterString.concat('none');
  }

  return filterString;
};

module.exports = {
  submittedFiltersArray,
  submittedFiltersObject,
  formatFieldValue,
  filtersToText,
};
