const { validationResult } = require('express-validator');

exports.handleValidationResult = (req, res) => {
  const validationResults = validationResult(req);
  if (!validationResults.isEmpty()) {
    return res.status(400).json({ status: 400, errors: validationResults.array() });
  }
};
