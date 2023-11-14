const { param } = require('express-validator');

const bankIdValidation = param('bankId')
  .exists()
  .withMessage('No bank id was provided')
  .isString()
  .withMessage('The bank id provided should be a string of numbers')
  .matches(/^\d+$/)
  .withMessage('The bank id provided should be a string of numbers');

module.exports = {
  bankIdValidation,
};
