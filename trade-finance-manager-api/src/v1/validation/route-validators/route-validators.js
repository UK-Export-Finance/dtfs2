const { param, body, checkSchema } = require('express-validator');
const { isValidIsoMonth } = require('../../../utils/date');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');
const { validateUpdateUtilisationReportPayloadReport } = require('../validate-payloads');

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

const isoMonthValidation = (fields) =>
  param(fields)
    .custom(isValidIsoMonth)
    .withMessage((value, { path }) => `'${path}' parameter must be an ISO month string (format 'yyyy-MM')`);

const updateReportStatusPayloadValidation = [
  body('user', "Expected body to contain 'user' object").exists().isObject(),
  body('reportsWithStatus', "Expected body to contain non-empty 'reportsWithStatus' array").exists().isArray({ min: 1 }),
  checkSchema({
    'reportsWithStatus.*.status': {
      isIn: {
        options: `${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED},${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED},${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}`,
        errorMessage: `Report status must be one of the following: ${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED},${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED},${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}`,
      },
    },
  }),
  body('reportsWithStatus.*.report', "'reportsWithStatus' array does not match any expected format")
    .isObject()
    .custom((report) => validateUpdateUtilisationReportPayloadReport(report)),
];

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

exports.updateReportStatusPayloadValidation = updateReportStatusPayloadValidation;

/**
 * Validates that specified route or query parameters are strings in ISO month format 'yyyy-MM'
 * @param {string | string[]} fields - the field name(s) to validate
 * @return {import('express-validator').ValidationChain[]}
 */
exports.isoMonthValidation = (fields) => [isoMonthValidation(fields)];
