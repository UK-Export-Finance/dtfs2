const { param } = require('express-validator');

const userParamNumericValidation = param('user').isAlphanumeric().withMessage('The User ID (user) provided should be numeric');
const facilityIdNumericValidation = param('facilityId').isNumeric().withMessage('The Facility ID (facilityId) provided should be numeric');
const amendmentIdNumericValidation = param('amendmentId').isNumeric().withMessage('The Amendment ID (amendmentId) provided should be numeric');
const dealIdNumericValidation = param('dealId').isNumeric().withMessage('The Amendment ID (amendmentId) provided should be numeric');
const partyURNNumericValidation = param('urn').isNumeric().withMessage('The party URN (urn) provided should be numeric');

exports.userEndpointValidation = [userParamNumericValidation];

exports.createFacilityAmendmentValidations = [facilityIdNumericValidation];

exports.getAmendmentFacilityByFacilityIdValidations = [facilityIdNumericValidation];

exports.getAmendmentFacilityByIdValidations = [facilityIdNumericValidation, amendmentIdNumericValidation];

exports.updateFacilityAmendmentValidations = [facilityIdNumericValidation, amendmentIdNumericValidation];

exports.getAmendmentInProgressValidations = [facilityIdNumericValidation];

exports.getCompletedAmendmentValidations = [facilityIdNumericValidation];

exports.getLatestCompletedAmendmentValueValidations = [facilityIdNumericValidation];

exports.getLatestCompletedAmendmentDateValidations = [facilityIdNumericValidation];

exports.getAmendmentsByDealIdValidations = [dealIdNumericValidation];

exports.getAmendmentInProgressByDealIdValidations = [dealIdNumericValidation];

exports.getCompletedAmendmentByDealIdValidations = [dealIdNumericValidation];

exports.getLatestCompletedAmendmentByDealIdValidations = [dealIdNumericValidation];

exports.getCompanyValidations = [partyURNNumericValidation];
