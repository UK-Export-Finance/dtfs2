"use strict";
const tslib_1 = require("tslib");
const { getNowAsEpochMillisecondString } = require('../../helpers/date');
const { number } = require('../../../external-api/api');
const { getAllFacilitiesByDealId, update: updateFacility } = require('./facilities.controller');
const { ukefSubmissionPortalActivity, facilityChangePortalActivity } = require('./portal-activities.controller');
const CONSTANTS = require('../../../constants');
const generateSubmissionData = (existingApplication) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const result = {
        date: existingApplication.submissionDate,
    };
    result.count = existingApplication.submissionCount + 1;
    if (!existingApplication.submissionDate) {
        result.date = getNowAsEpochMillisecondString();
    }
    return result;
});
/**
 * Generates an ID based on the provided entityType and dealId.
 * @param {string} options.entityType - The type of entity for which the ID is being generated.
 * @param {string} options.dealId - The ID of the deal or facility.
 * @returns {Promise<object>} Response from the number generator API.
 */
const generateId = (entityType, dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return number.getNumber(entityType, dealId); });
/**
 * Generates a unique identifier for a given entity (either a 'deal' or a 'facility') based on the provided application data.
 * @param {string} entity - The type of entity for which the unique identifier needs to be generated ('deal' or 'facility').
 * @param {object} application - The application data containing the necessary information to generate the identifier.
 * @returns {Promise<Object>} - The generated unique identifier for the specified entity.
 * @throws {Error} - If unable to generate the identifier.
 */
const generateUkefId = (entity, application) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let dealId;
        switch (entity) {
            case 'deal':
                dealId = application._id;
                break;
            case 'facility':
                dealId = application.dealId;
                break;
            default:
                dealId = null;
                break;
        }
        if (!dealId) {
            throw new Error('Invalid deal id');
        }
        const { data } = yield generateId(entity, dealId);
        if (!((_a = data.data) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error('Invalid response received');
        }
        const { data: ukefId } = data;
        return ukefId[0];
    }
    catch (error) {
        console.error('Unable to generate id %o', error);
        throw new Error('Unable to generate id');
    }
});
const addSubmissionDateToIssuedFacilities = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const facilities = yield getAllFacilitiesByDealId(dealId);
    // eslint-disable-next-line no-restricted-syntax
    for (const facility of facilities) {
        const { _id, hasBeenIssued, canResubmitIssuedFacilities, shouldCoverStartOnSubmission, issueDate, hasBeenIssuedAndAcknowledged } = facility;
        /**
         * checks if hasBeenIssued and if not hasBeenIssuedAndAcknowledged
         * ensures that once submitted to UKEF, the coverStartDate is not overwritten to the new resubmission date
         */
        if (hasBeenIssued && !hasBeenIssuedAndAcknowledged) {
            const update = {
                submittedAsIssuedDate: getNowAsEpochMillisecondString(),
            };
            /**
             * if canResubmitIssuedFacilities and shouldCoverStartOnSubmission is true
             * sets coverStartDate to issueDate
             * else if not canResubmitIssuedFacilities then set on submission to UKEF date
             * sets hour, min, seconds to midnight of the same day
             */
            if (shouldCoverStartOnSubmission) {
                if (canResubmitIssuedFacilities) {
                    update.coverStartDate = new Date(issueDate).setHours(0, 0, 0, 0);
                }
                else {
                    update.coverStartDate = new Date().setHours(0, 0, 0, 0);
                }
            }
            // eslint-disable-next-line no-await-in-loop
            yield updateFacility(_id, update);
        }
    }
    return facilities;
});
/*
  If facility has been changed to issued (after first submission)
  When submitting to UKEF, have to remove the canResubmitIssuedFacilities flag
  Ensures that cannot update this facility anymore
*/
const updateChangedToIssued = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const facilities = yield getAllFacilitiesByDealId(dealId);
    facilities.forEach((facility) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const { _id, canResubmitIssuedFacilities } = facility;
        if (canResubmitIssuedFacilities) {
            const update = {
                canResubmitIssuedFacilities: false,
            };
            yield updateFacility(_id, update);
        }
    }));
});
/**
 * Adds UKEF facility ID to facilities.
 *
 * @param {string} dealId - The ID of the deal.
 * @returns {Promise<Array>} - A promise that resolves to an array of facilities.
 * @throws {Error} - If unable to generate facility ID.
 */
const addUkefFacilityIdToFacilities = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const facilities = yield getAllFacilitiesByDealId(dealId);
    yield Promise.all(facilities.map((facility) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!facility.ukefFacilityId) {
            const { maskedId } = yield generateUkefId(CONSTANTS.NUMBER.ENTITY_TYPE.FACILITY, facility);
            const update = {
                ukefFacilityId: maskedId,
            };
            yield updateFacility(facility._id, update);
        }
    })));
    return facilities;
});
// checks if any canResubmitIssuedFacilities present
const checkForChangedFacilities = (facilities) => {
    let hasChanged = false;
    facilities.forEach((facility) => {
        if (facility.canResubmitIssuedFacilities) {
            hasChanged = true;
        }
    });
    return hasChanged;
};
// adds to the portalActivities array for submission to UKEF events
const submissionPortalActivity = (application) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { submissionCount, submissionType } = application;
    let { portalActivities } = application;
    const facilities = yield getAllFacilitiesByDealId(application._id);
    if (!submissionCount) {
        portalActivities = yield ukefSubmissionPortalActivity(application);
    }
    // if MIA then handled by central API
    if (checkForChangedFacilities(facilities) && submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
        portalActivities = yield facilityChangePortalActivity(application, facilities);
    }
    return portalActivities;
});
/**
 * Check the `coverDateConfirmed` property of the facility has the correct boolean flag.
 * @param {Object} app Application object
 * @returns {Bool} Facility(ies) was(were) updated or not
 */
const checkCoverDateConfirmed = (app) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let hasUpdated = false;
    if (app) {
        try {
            const facilities = yield getAllFacilitiesByDealId(app._id);
            const notYetSubmittedToUKEF = !app.submissionCount;
            const haveFacilities = (facilities === null || facilities === void 0 ? void 0 : facilities.length) > 0;
            const isAIN = app.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
            if (notYetSubmittedToUKEF && haveFacilities) {
                // Iterate through issued facilities
                facilities
                    .filter((f) => f.hasBeenIssued && !f.coverDateConfirmed)
                    .map((f) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                    hasUpdated = true;
                    yield updateFacility(f._id, {
                        coverDateConfirmed: Boolean(isAIN),
                    });
                }));
                // Iterate through unissued facilities
                facilities
                    .filter((f) => !f.hasBeenIssued && f.coverDateConfirmed)
                    .map((f) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                    hasUpdated = true;
                    yield updateFacility(f._id, {
                        coverDateConfirmed: false,
                    });
                }));
                return hasUpdated;
            }
        }
        catch (error) {
            console.error('Unable to set coverDateConfirmed for AIN facilities. %o', error);
        }
    }
    return hasUpdated;
});
/**
 * Adds submission data to an existing application.
 * @param {string} dealId - The ID of the deal.
 * @param {object} existingApplication - An object representing the existing application.
 * @returns {Promise<object>} - An object containing the submission count, submission date, portal activities, and UKEF deal ID.
 */
const addSubmissionData = (dealId, existingApplication) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield checkCoverDateConfirmed(existingApplication);
    yield addSubmissionDateToIssuedFacilities(dealId);
    const { count, date } = yield generateSubmissionData(existingApplication);
    const updatedPortalActivity = yield submissionPortalActivity(existingApplication);
    if (existingApplication.submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
        yield updateChangedToIssued(dealId);
    }
    const submissionData = {
        submissionCount: count,
        submissionDate: date,
        portalActivities: updatedPortalActivity,
    };
    if (!existingApplication.ukefDealId) {
        const { maskedId } = yield generateUkefId(CONSTANTS.NUMBER.ENTITY_TYPE.DEAL, existingApplication);
        submissionData.ukefDealId = maskedId;
    }
    yield addUkefFacilityIdToFacilities(dealId);
    return submissionData;
});
module.exports = {
    generateId,
    generateUkefId,
    addSubmissionData,
    submissionPortalActivity,
    addSubmissionDateToIssuedFacilities,
    updateChangedToIssued,
    checkCoverDateConfirmed,
};
