const { param } = require('express-validator');
const { isValidIsoMonth } = require('../../../utils/date');

const bankIdValidation = param('bankId').isString().matches(/^\d+$/).withMessage('The bank id provided should be a string of numbers');

exports.bankIdValidation = [bankIdValidation];

const mongoIdValidation = param('_id').isMongoId().withMessage("Invalid MongoDB '_id' path param provided");

exports.mongoIdValidation = [mongoIdValidation];

/**
 * Validator for a path parameter which is an sql integer id
 * @param {string} paramName - The parameter name
 * @returns {import('express-validator').ValidationChain}
 */
const sqlIdValidation = (paramName) => param(paramName).isInt({ min: 0 }).withMessage(`Invalid '${paramName}' path param provided`);

exports.sqlIdValidation = [sqlIdValidation];

/**
 * Validates that specified route or query parameters are strings in ISO month format 'yyyy-MM'
 * @param {string | string[]} fields - the field name(s) to validate
 * @return {import('express-validator').ValidationChain[]}
 */
exports.isoMonthValidation = (fields) => [
  param(fields)
    .custom(isValidIsoMonth)
    .withMessage((value, { path }) => `'${path}' parameter must be an ISO month string (format 'yyyy-MM')`),
];
