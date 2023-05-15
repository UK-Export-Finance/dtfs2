const { validationResult } = require('express-validator');

/**
 * Validation middleware, used on a per route basis to handle when validations are run on the inputs to an API route.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
// eslint-disable-next-line consistent-return
const handleValidationResult = (req, res, next) => {
  const validationResults = validationResult(req);
  if (!validationResults.isEmpty()) {
    return res.status(400).json({ status: 400, errors: validationResults.array() });
  }
  next();
};

module.exports = handleValidationResult;
