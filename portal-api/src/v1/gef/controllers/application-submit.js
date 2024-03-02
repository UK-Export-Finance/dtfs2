const { getNowAsEpochMillisecondString } = require('../../helpers/date');
const { number } = require('../../../external-api/api');
const { getAllFacilitiesByDealId, update: updateFacility } = require('./facilities.controller');
const { ukefSubmissionPortalActivity, facilityChangePortalActivity } = require('./portal-activities.controller');

const CONSTANTS = require('../../../constants');

const generateSubmissionData = async (existingApplication) => {
  const result = {
    date: existingApplication.submissionDate,
  };

  result.count = existingApplication.submissionCount + 1;

  if (!existingApplication.submissionDate) {
    result.date = getNowAsEpochMillisecondString();
  }

  return result;
};

/**
 * Generates an ID based on the provided entityType and dealId.
 * @param {string} options.entityType - The type of entity for which the ID is being generated.
 * @param {string} options.dealId - The ID of the deal or facility.
 * @returns {Promise<object>} Response from the number generator API.
 */
const generateId = async (entityType, dealId) => number.get(entityType, dealId);

/**
 * Generates a unique ID for a deal.
 * @param {Object} application - An object representing an application.
 * @returns {Promise<object>} - A promise that resolves to a unique ID for the deal.
 * @throws {Error} - If unable to generate the deal id.
 */
const generateUkefDealId = async (application) => {
  try {
    const { _id: dealId } = application;
    const entityType = 'deal';

    if (!dealId) {
      throw new Error('Void deal id');
    }

    const { data } = await generateId(entityType, dealId);

    return data;
  } catch (error) {
    console.error('Unable to generate deal id %o', error);
    throw new Error('Unable to generate deal id');
  }
};

/**
 * Generates a unique ID for a facility.
 * @param {Object} facility - The facility object for which the unique ID needs to be generated.
 * @returns {Promise<object>} - The generated unique ID for the facility.
 * @throws {Error} - If unable to generate the facility id.
 */
const generateUkefFacilityId = async (facility) => {
  try {
    const entityType = 'facility';
    const { dealId } = facility;

    if (!dealId) {
      throw new Error('Void deal id');
    }

    const { data } = await generateId(entityType, dealId);

    return data;
  } catch (error) {
    console.error('Unable to generate facility id %o', error);
    throw new Error('Unable to generate facility id');
  }
};

const addSubmissionDateToIssuedFacilities = async (dealId) => {
  const facilities = await getAllFacilitiesByDealId(dealId);
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
        } else {
          update.coverStartDate = new Date().setHours(0, 0, 0, 0);
        }
      }
      // eslint-disable-next-line no-await-in-loop
      await updateFacility(_id, update);
    }
  }
  return facilities;
};

/*
  If facility has been changed to issued (after first submission)
  When submitting to UKEF, have to remove the canResubmitIssuedFacilities flag
  Ensures that cannot update this facility anymore
*/
const updateChangedToIssued = async (dealId) => {
  const facilities = await getAllFacilitiesByDealId(dealId);

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

const addUkefFacilityIdToFacilities = async (dealId) => {
  const facilities = await getAllFacilitiesByDealId(dealId);

  await Promise.all(
    facilities.map(async (facility) => {
      if (!facility.ukefFacilityId) {
        const { maskedId } = await generateUkefFacilityId(facility);
        const update = {
          ukefFacilityId: maskedId,
        };
        await updateFacility(facility._id, update);
      }
    }),
  );

  return facilities;
};

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
const submissionPortalActivity = async (application) => {
  const { submissionCount, submissionType } = application;
  let { portalActivities } = application;

  const facilities = await getAllFacilitiesByDealId(application._id);

  if (!submissionCount) {
    portalActivities = await ukefSubmissionPortalActivity(application);
  }
  // if MIA then handled by central API
  if (checkForChangedFacilities(facilities) && submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    portalActivities = await facilityChangePortalActivity(application, facilities);
  }

  return portalActivities;
};

/**
 * Check the `coverDateConfirmed` property of the facility has the correct boolean flag.
 * @param {Object} app Application object
 * @returns {Bool} Facility(ies) was(were) updated or not
 */
const checkCoverDateConfirmed = async (app) => {
  let hasUpdated = false;

  if (app) {
    try {
      const facilities = await getAllFacilitiesByDealId(app._id);
      const notYetSubmittedToUKEF = !app.submissionCount;
      const haveFacilities = facilities?.length > 0;
      const isAIN = app.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;

      if (notYetSubmittedToUKEF && haveFacilities) {
        // Iterate through issued facilities
        facilities
          .filter((f) => f.hasBeenIssued && !f.coverDateConfirmed)
          .map(async (f) => {
            hasUpdated = true;
            await updateFacility(f._id, {
              coverDateConfirmed: Boolean(isAIN),
            });
          });

        // Iterate through unissued facilities
        facilities
          .filter((f) => !f.hasBeenIssued && f.coverDateConfirmed)
          .map(async (f) => {
            hasUpdated = true;
            await updateFacility(f._id, {
              coverDateConfirmed: false,
            });
          });
        return hasUpdated;
      }
    } catch (error) {
      console.error('Unable to set coverDateConfirmed for AIN facilities. %s', error);
    }
  }
  return hasUpdated;
};

const addSubmissionData = async (dealId, existingApplication) => {
  await checkCoverDateConfirmed(existingApplication);
  const { count, date } = await generateSubmissionData(existingApplication);
  const updatedPortalActivity = await submissionPortalActivity(existingApplication);
  await addSubmissionDateToIssuedFacilities(dealId);
  await addUkefFacilityIdToFacilities(dealId);
  /**
   * If AIN or MIN, portalActivities are handled by portal-API
   * If MIA -> MIN, then handled by tfm-API and central-API to add portalActivities
   */
  if (existingApplication.submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    await updateChangedToIssued(dealId);
  }

  const submissionData = {
    submissionCount: count,
    submissionDate: date,
    portalActivities: updatedPortalActivity,
  };

  if (!existingApplication.ukefDealId) {
    const { maskedId } = await generateUkefDealId(existingApplication);
    submissionData.ukefDealId = maskedId;
  }

  return submissionData;
};

module.exports = {
  generateId,
  generateUkefDealId,
  generateUkefFacilityId,
  addSubmissionData,
  submissionPortalActivity,
  addSubmissionDateToIssuedFacilities,
  updateChangedToIssued,
  checkCoverDateConfirmed,
};
