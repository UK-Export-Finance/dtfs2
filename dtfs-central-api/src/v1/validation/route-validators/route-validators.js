const { param } = require('express-validator');

const bankIdValidation = param('bankId').isString().matches(/^\d+$/).withMessage('The bank id provided should be a string of numbers');

exports.bankIdValidation = [bankIdValidation];

const mongoIdValidation = param('_id').isMongoId().withMessage("Invalid MongoDB '_id' path param provided");

exports.mongoIdValidation = [mongoIdValidation];
