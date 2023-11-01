const { param } = require('express-validator');

const bankIdValidation = param('bankId')
  .isString()
  .matches(/^\d+$/)
  .withMessage('The bank id provided should be a string of numbers');

exports.bankIdValidation = [bankIdValidation];
