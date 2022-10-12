const { validationResult } = require('express-validator');

/**
 * Finds the validation errors in a request and wraps it in an object with handy functions
 */
exports.hasValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
