"use strict";
const { param } = require('express-validator');
const bankIdValidation = param('bankId')
    .exists()
    .withMessage('No bank id was provided')
    .isString()
    .withMessage('The bank id provided should be a string of numbers')
    .matches(/^\d+$/)
    .withMessage('The bank id provided should be a string of numbers');
const mongoIdValidation = param('_id').isMongoId().withMessage("Invalid MongoDB '_id' path param provided");
module.exports = {
    bankIdValidation,
    mongoIdValidation,
};
