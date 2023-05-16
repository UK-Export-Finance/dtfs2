const { param } = require('express-validator');

const userParamAlphanumericValidation = param('user').isAlphanumeric().withMessage('The User ID (user) provided should be alphanumeric - a Mongo ID or a username');
const userParamMongoIdcValidation = param('user').isMongoId().withMessage('The User ID (user) provided should be a Mongo ID');
const facilityIdMongoIdValidation = param('facilityId').isMongoId().withMessage('The Facility ID (facilityId) provided should be a Mongo ID');
const amendmentIdMongoIdValidation = param('amendmentId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const dealIdMongoIdValidation = param('dealId').isMongoId().withMessage('The Amendment ID (amendmentId) provided should be a Mongo ID');
const partyURNValidation = param('urn')
  .isString()
  .matches(/^"\d+"$/)
  .withMessage('The party URN (urn) provided should be of the form /^"\d+"$/');

exports.userIdAlphanumericValidation = [userParamAlphanumericValidation];

exports.userIdMongoIdValidation = [userParamMongoIdcValidation];

exports.facilityIdValidation = [facilityIdMongoIdValidation];

exports.facilityIdAndAmendmentIdValidations = [facilityIdMongoIdValidation, amendmentIdMongoIdValidation];

exports.dealIdValidation = [dealIdMongoIdValidation];

exports.paryUrnValidation = [partyURNValidation];
