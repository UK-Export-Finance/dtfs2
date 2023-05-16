const { param } = require('express-validator');

const userParamNumericValidation = param('user').isMongoId().withMessage('The User ID (user) provided should be numeric');
const facilityIdNumericValidation = param('facilityId').isMongoId().withMessage('The Facility ID (facilityId) provided should be numeric');
const amendmentIdNumericValidation = param('amendmentId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be numeric');
const dealIdNumericValidation = param('dealId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be numeric');
const partyURNNumericValidation = param('urn')
  .isString()
  .matches(/^"\d+"$/)
  .withMessage('The party URN (urn) provided should be numeric');

exports.userIdValidation = [userParamNumericValidation];

exports.facilityIdValidation = [facilityIdNumericValidation];

exports.facilityIdAndAmendmentIdValidations = [facilityIdNumericValidation, amendmentIdNumericValidation];

exports.dealIdValidation = [dealIdNumericValidation];

exports.paryUrnValidation = [partyURNNumericValidation];
