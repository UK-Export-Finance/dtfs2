"use strict";
const tslib_1 = require("tslib");
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../portalActivity-object-generator/activityConstants');
const portalActivityGenerator = require('../../portalActivity-object-generator');
const CONSTANTS = require('../../../constants');
// retrieves user information from database
const getUserInfo = (userId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userCollectionName = 'users';
    let firstname = '';
    let surname = '';
    const userCollection = yield db.getCollection(userCollectionName);
    const userProfile = userId
        ? yield userCollection.findOne({ _id: { $eq: ObjectId(userId) } })
        : {};
    if (userProfile === null || userProfile === void 0 ? void 0 : userProfile.firstname) {
        firstname = userProfile.firstname;
        surname = userProfile.surname;
    }
    // creates user object which can be used
    const user = {
        firstname,
        surname,
        _id: userId,
    };
    return user;
});
// generates labels for portalActivities array based on type of submission
const submissionTypeToConstant = (submissionType) => {
    let submissionConstant;
    switch (submissionType) {
        case CONSTANTS.DEAL.SUBMISSION_TYPE.AIN:
            submissionConstant = PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION;
            break;
        case CONSTANTS.DEAL.SUBMISSION_TYPE.MIN:
            submissionConstant = PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION;
            break;
        case CONSTANTS.DEAL.SUBMISSION_TYPE.MIA:
            submissionConstant = PORTAL_ACTIVITY_LABEL.MIA_SUBMISSION;
            break;
        default:
            submissionConstant = null;
    }
    return submissionConstant;
};
const ukefSubmissionPortalActivity = (application) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { submissionType, portalActivities, checkerId } = application;
    // generates the label for activity array
    const applicationType = submissionTypeToConstant(submissionType);
    // creates user object to add to array
    const user = yield getUserInfo(checkerId);
    const activityParams = {
        type: applicationType,
        user,
        activityType: PORTAL_ACTIVITY_TYPE.NOTICE,
        activityText: '',
        activityHTML: '',
        facility: '',
        maker: '',
        checker: '',
    };
    // generates an activities object
    const activityObj = portalActivityGenerator(activityParams);
    // adds to beginning of portalActivities array so most recent displayed first
    portalActivities.unshift(activityObj);
    return portalActivities;
});
const facilityChangePortalActivity = (application, facilities) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { portalActivities, checkerId } = application;
    const checker = yield getUserInfo(checkerId);
    facilities.forEach((facility) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (facility.canResubmitIssuedFacilities) {
            // creates user object to add to array
            const maker = facility.unissuedToIssuedByMaker;
            const activityParams = {
                type: PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED,
                user: '',
                activityType: PORTAL_ACTIVITY_TYPE.FACILITY_STAGE,
                activityText: '',
                activityHTML: 'facility',
                facility,
                maker,
                checker,
            };
            // generates an activities object
            const activityObj = portalActivityGenerator(activityParams);
            // adds to beginning of portalActivities array so most recent displayed first
            portalActivities.unshift(activityObj);
        }
    }));
    return portalActivities;
});
module.exports = {
    ukefSubmissionPortalActivity,
    submissionTypeToConstant,
    getUserInfo,
    facilityChangePortalActivity,
};
