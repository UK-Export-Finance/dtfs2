/* eslint-disable no-param-reassign */

/**
 * Objective:
  The objective of the "escapeOperators" function is to escape certain operators in a given
  filter object, wrap inputs safely in either $regex or $eq and return a new object with these changes.

Inputs:
  "filter": a filter object that may contain certain operators that need to be escaped.

Flow:

  The flow creates a new object, that is returned once the following steps are processed.

  Check if the input "filter" is an object and not null.
  Iterate through the list of keys in "filter".

  If the value of the key is an array, escape it by creating a new object with either "$and" or "$or" operator and map through its conditions.
  (If it is neither "AND" or "OR", we do not escape it, but continue processing the nested objects)

  If a criteria contains the "REGEX" operator, escape it by creating a new object with the "$regex" operator.
  If a criteria does not contain the "REGEX" operator, escape it by creating a new nested object with the "$eq" operator.

Outputs:
  A new filter object with the escaped operators.

Additional aspects:
  The function only escapes the "AND", "OR", and "REGEX" operators.
  The function adds "$eq" to any criteria that is not an array or has the key "REGEX"
  If the input "filter" is not an object or is null, it will be returned as is.
 */

/**
 * This function escapes MongoDB operators from the filter object
 * @param {Object} filter Object comprising of filters
 * @returns {Object} Escaped filter object
 */

const getArrayKeyOperatorName = (key) => {
  if (key === 'AND') {
    return '$and';
  }
  if (key === 'OR') {
    return '$or';
  }
  return key;
};

const recursivelyReplaceEscapeOperators = (filter, result = {}) => {
  if (typeof filter !== 'object' || filter == null) {
    return filter;
  }

  const keys = Object.keys(filter);

  keys.forEach((key) => {
    // This handles when there is an array -- ie in the case of AND and OR
    if (Array.isArray(filter[key])) {
      const newKeyName = getArrayKeyOperatorName(key);
      if (!result[newKeyName]) {
        result[newKeyName] = [];
      }
      filter[key].forEach((condition, i) => {
        result[newKeyName][i] = {};
        recursivelyReplaceEscapeOperators(condition, result[newKeyName][i]);
      });
      // This handles nested objects ie {example: {REGEX: 'example'}}
    } else if (typeof filter[key] === 'object' && filter[key] !== null) {
      result[key] = {};
      recursivelyReplaceEscapeOperators(filter[key], result[key]);
      // These last two if statements handle the lowest level cases
    } else if (key === 'REGEX') {
      result.$regex = filter[key];
    } else {
      result[key] = {
        $eq: filter[key],
      };
    }
  });
  return result;
};

const escapeOperators = (filter) => recursivelyReplaceEscapeOperators(filter);

module.exports = {
  escapeOperators,
};
