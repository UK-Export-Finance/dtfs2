"use strict";
const tslib_1 = require("tslib");
const { HttpStatusCode } = require('axios');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { addComment } = require('./deal-comments.controller');
const { userHasAccessTo } = require('../users/checks');
const validateStateChange = require('../validation/deal-status');
const userCanSubmitDeal = require('./deal-status/user-can-submit-deal');
const updateStatus = require('./deal-status/update-status');
const createSubmissionDate = require('./deal-status/create-submission-date');
const createMiaSubmissionDate = require('./deal-status/create-mia-submission-date');
const updateSubmissionCount = require('./deal-status/update-submission-count');
const sendStatusUpdateEmails = require('./deal-status/send-status-update-emails');
const createApprovalDate = require('./deal-status/create-approval-date');
const updateFacilityCoverStartDates = require('./deal-status/update-facility-cover-start-dates');
const updateIssuedFacilities = require('./deal-status/update-issued-facilities');
const updateSubmittedIssuedFacilities = require('./deal-status/update-submitted-issued-facilities');
const createUkefIds = require('./deal-status/create-ukef-ids');
const api = require('../api');
const CONSTANTS = require('../../constants');
/**
 * Finds a specific deal by its ID and sends the deal's status as the response.
 * @param {Request} req - The request object containing the parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Response} - Response with status code, if Ok then with deal status
 */
exports.findOne = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const deal = yield findOneDeal(req.params.id);
        if (!deal) {
            return res.status(HttpStatusCode.NotFound).send();
        }
        if (!userHasAccessTo(req.user, deal)) {
            return res.status(HttpStatusCode.Unauthorized).send();
        }
        return res.status(HttpStatusCode.Ok).send(deal.status);
    }
    catch (error) {
        console.error('❌ Unable to find deal %s %o', req.params.id, error);
        return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Unable to find deal' });
    }
});
/**
 * Updates the status of a deal based on the new status provided in the request body.
 * @param {Response} req - The request object.
 * @param {Request} res - The response object.
 * @returns {Promise<Response>} - The latest deal information.
 */
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { user } = req;
        const dealId = req.params.id;
        const newStatus = req.body.status;
        const deal = yield findOneDeal(dealId);
        if (!deal) {
            return res.status(HttpStatusCode.NotFound).send();
        }
        if (!userHasAccessTo(user, deal)) {
            return res.status(HttpStatusCode.Unauthorized).send();
        }
        const currentStatus = deal.status;
        console.info('Updating portal deal %s status from %s to %s', dealId, currentStatus, newStatus);
        if (newStatus !== CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL && newStatus !== CONSTANTS.DEAL.DEAL_STATUS.ABANDONED) {
            if (!userCanSubmitDeal(deal, user)) {
                return res.status(HttpStatusCode.Unauthorized).send();
            }
        }
        const validationErrors = yield validateStateChange(deal, req.body, user);
        if (validationErrors) {
            return res.status(HttpStatusCode.Ok).send(Object.assign({ success: false }, validationErrors));
        }
        let updatedDeal = yield updateStatus(dealId, currentStatus, newStatus, user);
        // First submission of the deal to the checker
        if (currentStatus === CONSTANTS.DEAL.DEAL_STATUS.DRAFT && newStatus === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL) {
            yield updateFacilityCoverStartDates(user, updatedDeal);
        }
        // Add a comment to the deal
        if (req.body.comments) {
            updatedDeal = yield addComment(dealId, req.body.comments, user);
        }
        // Update the deal
        if (newStatus !== CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED && newStatus !== CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF) {
            updatedDeal = yield updateDeal(dealId, updatedDeal, user);
        }
        // Subsequent submission of the deal to the checker
        if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL) {
            const canUpdateIssuedFacilitiesCoverStartDates = true;
            const newIssuedFacilityStatus = 'Ready for check';
            updatedDeal = yield updateIssuedFacilities(user, currentStatus, updatedDeal, canUpdateIssuedFacilitiesCoverStartDates, newIssuedFacilityStatus);
        }
        // Send back the deal to the maker
        if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED) {
            const newIssuedFacilityStatus = "Maker's input required";
            updatedDeal = yield updateIssuedFacilities(user, currentStatus, updatedDeal, false, newIssuedFacilityStatus);
        }
        // Submit to UKEF / TFM
        if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF) {
            console.info('Submit deal %s to UKEF', dealId);
            yield updateSubmittedIssuedFacilities(user, updatedDeal);
            updatedDeal = yield updateSubmissionCount(updatedDeal, user);
            if (!((_a = updatedDeal === null || updatedDeal === void 0 ? void 0 : updatedDeal.details) === null || _a === void 0 ? void 0 : _a.submissionDate)) {
                updatedDeal = yield createSubmissionDate(dealId, user);
            }
            if (updatedDeal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA && !updatedDeal.details.manualInclusionApplicationSubmissionDate) {
                updatedDeal = yield createMiaSubmissionDate(dealId, user);
            }
            if (((_b = updatedDeal === null || updatedDeal === void 0 ? void 0 : updatedDeal.details) === null || _b === void 0 ? void 0 : _b.submissionCount) === 1) {
                updatedDeal = yield createUkefIds(updatedDeal, user);
            }
            yield api.tfmDealSubmit(dealId, CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS, user);
        }
        // UKEF Approval
        if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS || newStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
            updatedDeal = yield createApprovalDate(dealId);
        }
        // Send status update emails
        if (newStatus !== currentStatus) {
            yield sendStatusUpdateEmails(updatedDeal, currentStatus, user);
        }
        const dealLatest = yield findOneDeal(dealId);
        return res.status(HttpStatusCode.Ok).send(dealLatest);
    }
    catch (error) {
        console.error('❌ Unable to update the deal %o', error);
        return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Unable to update the deal' });
    }
});
