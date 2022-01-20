const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');

const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../portalActivity-object-generator/activityConstants');
const portalActivityGenerator = require('../../portalActivity-object-generator');

const CONSTANTS = require('../../../constants');

// retrieves user information from database
const getUserInfo = async (userId) => {
  const userCollectionName = 'users';

  const userCollection = await db.getCollection(userCollectionName);
  const {
    firstname,
    surname = '',
  } = userId
    ? await userCollection.findOne({ _id: new ObjectID(String(userId)) })
    : {};

  // creates user object which can be used
  const user = {
    firstname,
    surname,
    _id: userId,
  };
  return user;
};

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

const firstSubmissionPortalActivity = async (application) => {
  const { submissionType, portalActivities, checkerId } = application;

  // generates the label for activity array
  const applicationType = submissionTypeToConstant(submissionType);
  // creates user object to add to array
  const user = await getUserInfo(checkerId);
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
};

const facilityChangePortalActivity = async (application, facilities) => {
  const { portalActivities, checkerId } = application;
  const checker = await getUserInfo(checkerId);

  facilities.forEach(async (facility) => {
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
  });

  return portalActivities;
};

module.exports = {
  firstSubmissionPortalActivity,
  submissionTypeToConstant,
  getUserInfo,
  facilityChangePortalActivity,
};
