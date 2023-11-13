const { check } = require('express-validator');

const bankIdValidation = check('bankId')
  .exists()
  .withMessage('No bank id was provided')
  .isString()
  .withMessage('The bank id provided should be a string of numbers')
  .matches(/^\d+$/)
  .withMessage('The bank id provided should be a string of numbers');

module.exports = {
  bankIdValidation,
};
