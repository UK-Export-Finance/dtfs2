const { param } = require('express-validator');

const userParamAlphaNumericValidation = param('user').isAlphanumeric().withMessage('The User ID provided should contain letters and numbers only');
const facilityIdAlphaNumericValidation = param('facilityId').isNumeric().withMessage('The facilityId provided should contain letters and numbers only');
const amendmentIdAlphaNumericValidation = param('amendmentId').isNumeric().withMessage('The amendmentId provided should contain letters and numbers only');

exports.userEndpointValidation = [userParamAlphaNumericValidation];

exports.getAmendmentFacilityByFacilityIdValidations = [facilityIdAlphaNumericValidation];

exports.getAmendmentFacilityByIdValidations = [facilityIdAlphaNumericValidation, amendmentIdAlphaNumericValidation];

exports.updateFacilityAmendmentValidations = [facilityIdAlphaNumericValidation, amendmentIdAlphaNumericValidation];

exports.getAmendmentInProgressValidations = [amendmentIdAlphaNumericValidation];
