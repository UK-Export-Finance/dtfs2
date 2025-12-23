const escapeStringRegexp = require('escape-string-regexp');
const { FACILITY_STAGE, CHECKERS_AMENDMENTS_DEAL_ID } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');

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

  If a criteria contains the "KEYWORD" key, escape any regex characters and create a new object with the "$regex" operator
  If a criteria does not contain the "KEYWORD" key, escape it by creating a new nested object with the "$eq" operator.

Outputs:
  A new filter object with the escaped operators.

Additional aspects:
  The function only escapes the "AND" and "OR" operators.
  The function converts any "KEYWORD" into an escaped $regex operator
  The function adds "$eq" to any criteria that is not an array.
  If the input "filter" is not an object or is null, it will be returned as is.
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

/**
 * This function escapes MongoDB operators from the filter object
 * @param {object} filters Object comprising of filters
 * @returns {object} Escaped filter object
 */

const recursivelyReplaceEscapeOperators = (filters, result = {}) => {
  if (typeof filters !== 'object' || filters == null) {
    return filters;
  }

  const keys = Object.keys(filters);

  keys.forEach((key) => {
    // This handles when there is an array -- ie in the case of AND and OR
    if (Array.isArray(filters[key])) {
      const newKeyName = getArrayKeyOperatorName(key);
      /**
       * This handles CHECKERS_AMENDMENTS_DEAL_ID  key
       * When  key is present, transforms filter _id within the array of dealIds
       */
      if (newKeyName === CHECKERS_AMENDMENTS_DEAL_ID) {
        result._id = { $in: filters[newKeyName].map((dealId) => new ObjectId(dealId)) };
      } else {
        if (!result[newKeyName]) {
          result[newKeyName] = [];
        }

        filters[key].forEach((condition, i) => {
          result[newKeyName][i] = {};
          recursivelyReplaceEscapeOperators(condition, result[newKeyName][i]);
        });
      }

      // This handles nested objects ie {example: {REGEX: 'example'}}
    } else if (typeof filters[key] === 'object' && filters[key] !== null) {
      result[key] = {};
      recursivelyReplaceEscapeOperators(filters[key], result[key]);
      // These last few statements handle the lowest level cases
    } else if (key === 'KEYWORD') {
      result.$regex = escapeStringRegexp(filters[key]);
    } else if (key === 'hasBeenIssued') {
      result.hasBeenIssued = {
        $eq: filters.hasBeenIssued,
      };
      // When filtering by `hasBeenIssued`, want to exclude cases where `facilityStage` is 'Risk expired'
      result.facilityStage = { $ne: FACILITY_STAGE.RISK_EXPIRED };
    } else {
      result[key] = {
        $eq: filters[key],
      };
    }
  });
  return result;
};

const escapeOperators = (filters) => recursivelyReplaceEscapeOperators(filters);

module.exports = {
  escapeOperators,
};
