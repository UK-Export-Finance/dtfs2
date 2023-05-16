const { param } = require('express-validator');

const userParamNumericValidation = param('user').isAlphanumeric().withMessage('The User ID (user) provided should be alphanumeric, a Mongo ID or username');
const facilityIdNumericValidation = param('facilityId').isMongoId().withMessage('The Facility ID (facilityId) provided should be a Mongo ID');
const amendmentIdNumericValidation = param('amendmentId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const dealIdNumericValidation = param('dealId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const partyURNNumericValidation = param('urn')
  .isString()
  .matches(/^"\d+"$/)
  .withMessage('The party URN (urn) provided should be of the form /^"\d+"$/');

exports.userIdValidation = [userParamNumericValidation];

exports.facilityIdValidation = [facilityIdNumericValidation];

exports.facilityIdAndAmendmentIdValidations = [facilityIdNumericValidation, amendmentIdNumericValidation];

exports.dealIdValidation = [dealIdNumericValidation];

exports.paryUrnValidation = [partyURNNumericValidation];
