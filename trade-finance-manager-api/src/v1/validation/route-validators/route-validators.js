const { param, body, checkSchema, oneOf } = require('express-validator');
const { isValidIsoMonth } = require('../../../utils/date');
const { isValidMongoId } = require('../validateIds');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');
const { isNumber } = require('../../helpers/number');

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
  body('user').exists().isObject().withMessage("Expected body to contain 'user' object"),
  body('reportsWithStatus').exists().isArray({ min: 1 }).withMessage("Expected body to contain non-empty 'reportsWithStatus' array"),
  checkSchema({
    'reportsWithStatus.*.status': {
      isIn: {
        options: `${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED},${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}`,
        errorMessage: `Report status must be one of the following: ${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED},${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}`,
      },
    },
  }),
  oneOf([
    checkSchema({
      'reportsWithStatus.*.report.id': {
        isString: true,
        errorMessage: 'Report id must be a string',
        custom: {
          options: isValidMongoId,
          errorMessage: 'Report id must be a valid mongo id',
        },
      },
    }),
    checkSchema({
      'reportsWithStatus.*.report.bankId': {
        isString: true,
        errorMessage: 'Bank id must be a string',
      },
      'reportsWithStatus.*.report.month': {
        isInt: {
          options: {
            lt: 13,
            gt: 0,
          },
          errorMessage: 'Report month must be an integer between 1 and 12 inclusive',
        },
        custom: {
          options: isNumber,
          errorMessage: 'Report month must be a number',
        },
      },
      'reportsWithStatus.*.report.year': {
        isInt: {
          options: {
            gt: 0,
          },
          errorMessage: 'Report year must be a positive integer',
        },
        custom: {
          options: isNumber,
          errorMessage: 'Report month must be a number',
        },
      },
    }),
  ]),
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
