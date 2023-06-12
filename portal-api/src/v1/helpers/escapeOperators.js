/**
 * Objective:
    The objective of the "escapeOperators" function is to escape the
    "AND" and "OR" operators in a given filter object and return a new object with the escaped operators.

Inputs:
    "filter": a JavaScript object that may contain "AND" and "OR" operators.

Flow:
    Check if "filter" exists.
    If "AND" operator exists in "filter", create a new object with "$and" key and value of "filter.AND".
    For each element in "$and" array, check if "OR" operator exists.
    If "OR" operator exists, create a new object with "$or" key and value of "e.OR", delete "OR" key from "e", and return the new object.
    Replace the original element with the new object in the "$and" array.
    Delete the "AND" key from the new object and return it.

Outputs:
    A new JavaScript object with escaped "AND" and "OR" operators.

Additional aspects:
    The function only escapes "AND" and "OR" operators, and does not modify any other keys or values in the input object.
    If the input object does not contain "AND" or "OR" operators, the function simply returns the input object.
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
        if (e.OR) {
          const orPayload = {
            $or: e.OR,
          };

          delete e.OR;

          return orPayload;
        }

        return e;
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
