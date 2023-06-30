const { replaceCharactersWithCharacterCode } = require('../../../helpers/sanitiseData');

const ALLOWED_PARAMS = ['passwordreset', 'passwordupdated', 'passwordreseterror'];
const MAXIMUM_PARAMS = 1;

/**
 * Get a sanitised query value. Handles:
 * 1) Query value as a string
 * 2) Query value as an array of strings
 * 3) Empty string or array
 * @param {String} Query value
 * @returns {String} Sanitised query value
 */
const getSanitisedQueryValue = (value) => {
  if (value && value.length) {
    if (Array.isArray(value)) {
      return replaceCharactersWithCharacterCode(value[0]);
    }

    return replaceCharactersWithCharacterCode(value);
  }

  return null;
};

/**
 * Global middleware, ensures that only allowed query parameters are consumed and sanitised.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
const queryParams = (req, res, next) => {
  const arr = Object.keys(req.query);

  if (arr.length) {
    /**
     * Filter out any params that are not in the allowed list.
     * We do not need to care or consume any params that are not used.
     */
    const filtered = arr.filter((key) => ALLOWED_PARAMS.includes(key));

    if (filtered.length) {
      /**
       * If the filtered list is above MAXIMUM_PARAMS,
       * this indicates that someone could be trying to tamper with the system. Therefore:
       * 1) Change the params to be empty.
       * 2) Return 400 status code.
       */
      if (filtered.length > MAXIMUM_PARAMS) {
        req.query = {};
        res.status(400);
      } else {
        /**
         * Only one allowed query param has been provided.
         * 1) Get the key.
         * 2) Get a single value of key.
         * 3) Santise the value
         * 4) Construct a fresh query object.
         */
        const [firstKey] = filtered;
        const sanitisedValue = getSanitisedQueryValue(req.query[firstKey]);

        req.query = {
          [firstKey]: sanitisedValue,
        };
      }

      return next();
    }

    /**
     * Filtered query params do not match anything in the allowed list.
     * this indicates that someone could be trying to tamper with the system. Therefore:
     * 1) Change the params to be empty.
     * 2) Return 400 status code.
     */
    req.query = {};
    res.status(400);
  }

  return next();
};

module.exports = {
  getSanitisedQueryValue,
  queryParams,
};
