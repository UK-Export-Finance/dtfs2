const { getUnixTime } = require('date-fns');

const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');

const { findOneGefDeal } = require('./get-deal.controller');
const { updateGefDeal } = require('./update-deal.controller');
const { findAllGefFacilitiesByDealId } = require('../facility/get-facilities.controller');
const { updateGefFacility } = require('../facility/update-facility.controller');

const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../../constants/activityConstants');

/**
 * canResubmitIssuedFacilities - changes flags to false
 * @param {Object} facilities
 */
const updateChangedToIssued = (facilities) => {
  facilities.forEach(async (facility) => {
    const { _id, canResubmitIssuedFacilities } = facility;

    if (canResubmitIssuedFacilities) {
      const update = {
        canResubmitIssuedFacilities: false,
      };

      await updateGefFacility(_id, update);
    }
  });
};

// retrieves user information from database
const getUserInfo = async (userId) => {
  if (ObjectId.isValid(userId)) {
    const userCollectionName = 'users';

    const userCollection = await db.getCollection(userCollectionName);
    const {
      firstname,
      surname = '',
    } = userId
      ? await userCollection.findOne({ _id: new ObjectId(String(userId)) })
      : {};

    // creates user object which can be used
    const user = {
      firstname,
      surname,
      _id: userId,
    };
    return user;
  }
  return { status: 400, message: 'Invalid User Id' };
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
    ukefFacilityId: facility ? facility.ukefFacilityId : '',
    facilityId: facility ? facility._id : '',
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
  try {
    const { checkerId, portalActivities } = application;
    const checker = await getUserInfo(checkerId);

    facilities.forEach((facility) => {
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
  } catch (err) {
    console.error(`Central-API: error adding facility activity object ${err}`);
    return err;
  }
};

/**
 * Generates activity for MIN submission to UKEF
 * Adds to front of portalActivities array in correct format
 * @param {Object} application
 * @returns {Array} portalActivities
 */
const ukefSubmissionPortalActivity = async (application) => {
  try {
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
  } catch (err) {
    console.error(`Central-API: error adding submission activity object ${err}`);
    return err;
  }
};

/**
 * Generates MIN Activity objects for submission and changed facilities
 * Removes flag for changedToIssued facility
 * Returns updated deal
 * @param {*} req
 * @param {*} res
 */
const generateMINActivities = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const dealId = req.params.id;

      const application = await findOneGefDeal(dealId);

      if (application) {
        const facilities = await findAllGefFacilitiesByDealId(dealId);
        let { portalActivities } = application;

        portalActivities = await ukefSubmissionPortalActivity(application);
        portalActivities = await facilityChangePortalActivity(application, facilities);

        const update = {
          portalActivities,
        };

        await updateChangedToIssued(facilities);

        const updatedDeal = await updateGefDeal(dealId, update);

        res.status(200).send(updatedDeal);
      }
      res.status(404).send();
    } catch (err) {
      console.error(`Central-API - Error generating MIN activities ${err}`);
      res.status(400).send();
    }
  } else {
    res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};

module.exports = {
  generateMINActivities,
  ukefSubmissionPortalActivity,
  facilityChangePortalActivity,
  portalActivityGenerator,
  getUserInfo,
  updateChangedToIssued,
};
