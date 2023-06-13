/**
 * Objective:
  The objective of the "escapeOperators" function is to escape certain operators in a given
  filter object and return a new object with the escaped operators.

Inputs:
  "filter": a filter object that may contain certain operators that need to be escaped.

Flow:
  Check if the input "filter" is an object and not null.
  If the input "filter" contains the "AND" operator, escape it by creating a new object with the "$and" operator and map through its conditions.
  If a condition contains the "OR" operator, escape it by creating a new object with the "$or" operator and map through its criteria.
  If a criteria contains the "REGEX" operator, escape it by creating a new object with the "$regex" operator.
  Delete the original operators from the new objects and return the final escaped filter object.

Outputs:
  A new filter object with the escaped operators.

Additional aspects:
  The function only escapes the "AND", "OR", and "REGEX" operators.
  If the input "filter" is not an object or is null, it will be returned as is.
 */

/**
 * This function escapes MongoDB operators from the filter object
 * @param {Object} filter Object comprising of filters
 * @returns {Object} Escaped filter object
 */
const escapeOperators = (filter) => {
  if (typeof filter === 'object' && filter !== null) {
    // Escape `AND` operator
    if ('AND' in filter) {
      const payload = {
        $and: filter.AND,
      };

      // Escape `OR` operator
      payload.$and = payload.$and.map((e) => {
        const condition = e;

        if (condition.OR) {
          const orPayload = {
            $or: condition.OR,
          };

          // Escape `REGEX` operator
          orPayload.$or = orPayload.$or.map((criteria) => {
            const value = Object.values(criteria);
            const key = Object.keys(criteria);

            if (!value || !value.length) {
              return criteria;
            }

            if (value[0].REGEX) {
              const regexPayload = {
                [key]: {
                  $regex: value[0].REGEX,
                },
              };

              return regexPayload;
            }

            return criteria;
          });

          delete condition.OR;

          return orPayload;
        }

        return condition;
      });

      delete payload.AND;

      return payload;
    }
  }
  return filter;
};

module.exports = {
  escapeOperators,
};
