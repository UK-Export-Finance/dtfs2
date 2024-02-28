const { param } = require('express-validator');
const { isValidIsoMonth } = require('../../../utils/date');
const { updateReportStatusPayloadValidation } = require('./update-report-status-payload-validation');

const userParamEscapingSanitization = param('user').isString('User ID must be a string').escape();
const userParamValidation = param('user').isMongoId().withMessage('The User ID (user) provided should be a Mongo ID');
const facilityIdValidation = param('facilityId').isMongoId().withMessage('The Facility ID (facilityId) provided should be a Mongo ID');
const amendmentIdValidation = param('amendmentId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const dealIdValidation = param('dealId').isMongoId().withMessage('The Deal ID (dealId) provided should be a Mongo ID');
const groupIdValidation = param('groupId').isInt().withMessage('The Group ID (groupId) provided should be an integer');
const taskIdValidation = param('taskId').isInt().withMessage('The Task ID (taskId) provided should be an integer');
const partyURNValidation = param('urn').isString().matches(/^\d+$/).withMessage('The party URN (urn) provided should be a string of numbers');

const bankIdValidation = param('bankId')
  .exists()
  .withMessage('No bank id was provided')
  .isString()
  .withMessage('The bank id provided should be a string of numbers')
  .matches(/^\d+$/)
  .withMessage('The bank id provided should be a string of numbers');

const mongoIdValidation = param('_id').isMongoId().withMessage("Invalid MongoDB '_id' path param provided");

const sqlIdValidation = param('id').isInt().withMessage("Invalid 'id' path param provided");

const isoMonthValidation = (fields) =>
  param(fields)
    .custom(isValidIsoMonth)
    .withMessage((value, { path }) => `'${path}' parameter must be an ISO month string (format 'yyyy-MM')`);



exports.userIdEscapingSanitization = [userParamEscapingSanitization];

exports.userIdValidation = [userParamValidation];

exports.facilityIdValidation = [facilityIdValidation];

exports.facilityIdAndAmendmentIdValidations = [facilityIdValidation, amendmentIdValidation];

exports.dealIdValidation = [dealIdValidation];

exports.groupIdValidation = [groupIdValidation];

exports.taskIdValidation = [taskIdValidation];

exports.partyUrnValidation = [partyURNValidation];

exports.bankIdValidation = [bankIdValidation];

exports.mongoIdValidation = [mongoIdValidation];

exports.sqlIdValidation = [sqlIdValidation];

exports.updateReportStatusPayloadValidation = updateReportStatusPayloadValidation;

/**
 * Validates that specified route or query parameters are strings in ISO month format 'yyyy-MM'
 * @param {string | string[]} fields - the field name(s) to validate
 * @return {import('express-validator').ValidationChain[]}
 */
exports.isoMonthValidation = (fields) => [isoMonthValidation(fields)];
