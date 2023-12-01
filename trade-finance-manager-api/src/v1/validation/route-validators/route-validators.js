const { param } = require('express-validator');
const { isValidIsoMonth } = require('../../../utils/date');

const userParamEscapingSanitization = param('user').isString('User ID must be a string').escape();
const userParamValidation = param('user').isMongoId().withMessage('The User ID (user) provided should be a Mongo ID');
const facilityIdValidation = param('facilityId').isMongoId().withMessage('The Facility ID (facilityId) provided should be a Mongo ID');
const amendmentIdValidation = param('amendmentId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const dealIdValidation = param('dealId').isMongoId().withMessage('The Deal ID (dealId) provided should be a Mongo ID');
const groupIdValidation = param('groupId').isInt().withMessage('The Group ID (groupId) provided should be an integer');
const taskIdValidation = param('taskId').isInt().withMessage('The Task ID (taskId) provided should be an integer');
const partyURNValidation = param('urn').isString().matches(/^\d+$/).withMessage('The party URN (urn) provided should be a string of numbers');

exports.userIdEscapingSanitization = [userParamEscapingSanitization];

exports.userIdValidation = [userParamValidation];

exports.facilityIdValidation = [facilityIdValidation];

exports.facilityIdAndAmendmentIdValidations = [facilityIdValidation, amendmentIdValidation];

exports.dealIdValidation = [dealIdValidation];

exports.groupIdValidation = [groupIdValidation];

exports.taskIdValidation = [taskIdValidation];

exports.partyUrnValidation = [partyURNValidation];

/**
 * Validates that specified route or query parameters are strings in ISO month format 'yyyy-MM'
 * @param {string | string[]} fields - the field name(s) to validate
 * @return {import('express-validator').ValidationChain[]}
 */
exports.isoMonthValidation = (fields) => [
  param(fields)
    .custom((things) => isValidIsoMonth(things))
    .withMessage((value, { path }) => `'${path}' parameter must be an ISO month string (format 'yyyy-MM')`),
];
