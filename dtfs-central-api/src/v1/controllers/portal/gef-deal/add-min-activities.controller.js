const { getUnixTime } = require('date-fns');

const { ObjectID } = require('mongodb');
const db = require('../../../../drivers/db-client');

const { findOneDeal } = require('./get-gef-deal.controller');
const { updateDeal } = require('./update-deal.controller');
const { findAllGefFacilitiesByDealId } = require('../gef-facility/get-facilities.controller');
const { updateFacility } = require('../gef-facility/update-facility.controller');

const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../../constants/activityConstants');

/**
 * canResubmitIssuedFacilities - changes flags to false
 * @param {Object} facilities
 */
const updateChangedToIssued = async (facilities) => {
  facilities.forEach(async (facility) => {
    const { _id, canResubmitIssuedFacilities } = facility;

    if (canResubmitIssuedFacilities) {
      const update = {
        canResubmitIssuedFacilities: false,
      };

      await updateFacility(_id, update);
    }
  });
};

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

// creates portal activity object to store in DB
const portalActivityGenerator = (activityParams) => {
  const {
    type,
    user,
    activityType,
    activityText,
    activityHTML,
    facility,
    maker,
    checker,
  } = activityParams;

  const userToAdd = {
    firstName: user.firstname,
    lastName: user.surname,
    _id: user._id,
  };

  const portalActivityObj = {
    type: activityType,
    timestamp: getUnixTime(new Date()),
    author: userToAdd,
    text: activityText,
    label: type,
    html: activityHTML,
    facilityType: facility ? `${facility.type} facility` : '',
    facilityID: facility ? facility.ukefFacilityId : '',
    maker,
    checker,
  };

  return portalActivityObj;
};

/**
 * For facilities changed to issued
 * adds to front of portalActivity array in correct format
 * @param {Object} application
 * @param {Array} facilities
 * @returns {Array} portalActivities
 */
const facilityChangePortalActivity = async (application, facilities) => {
  const { checkerId, portalActivities } = application;
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

/**
 * Generates activity for MIN submission to UKEF
 * Adds to front of portalActivities array in correct format
 * @param {Object} application
 * @returns {Array} portalActivities
 */
const ukefSubmissionPortalActivity = async (application) => {
  const { portalActivities, checkerId } = application;

  // generates the label for activity array
  const applicationType = PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION;
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

/**
 * Generates MIN Activity objects for submission and changed facilities
 * Removes flag for changedToIssued facility
 * Returns updated deal
 * @param {*} req
 * @param {*} res
 */
const generateMINActivities = async (req, res) => {
  const dealId = req.params.id;

  const application = await findOneDeal(dealId);

  if (application) {
    const facilities = await findAllGefFacilitiesByDealId(dealId);
    let { portalActivities } = application;

    portalActivities = await ukefSubmissionPortalActivity(application);
    portalActivities = await facilityChangePortalActivity(application, facilities);

    const update = {
      portalActivities,
    };

    await updateChangedToIssued(facilities);

    const updatedDeal = await updateDeal(dealId, update);

    res.status(200).send(updatedDeal);
  }
  res.status(404);
};

module.exports = {
  generateMINActivities,
  ukefSubmissionPortalActivity,
  facilityChangePortalActivity,
  portalActivityGenerator,
  getUserInfo,
  updateChangedToIssued,
};
