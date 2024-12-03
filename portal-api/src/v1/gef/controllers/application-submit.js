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
 * @returns {Promise<Object>} Response from the number generator API.
 */
const generateId = async (entityType, dealId) => number.getNumber(entityType, dealId);

/**
 * Generates a unique identifier for a given entity (either a 'deal' or a 'facility') based on the provided application data.
 * @param {string} entity - The type of entity for which the unique identifier needs to be generated ('deal' or 'facility').
 * @param {Object} application - The application data containing the necessary information to generate the identifier.
 * @returns {Promise<Object>} - The generated unique identifier for the specified entity.
 * @throws {Error} - If unable to generate the identifier.
 */
const generateUkefId = async (entity, application) => {
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

    const { data } = await generateId(entity, dealId);

    if (!data.data?.length) {
      throw new Error('Invalid response received');
    }

    const { data: ukefId } = data;

    return ukefId[0];
  } catch (error) {
    console.error('Unable to generate id %o', error);
    throw new Error('Unable to generate id');
  }
};

const addSubmissionDateToIssuedFacilities = async (dealId, auditDetails) => {
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
      await updateFacility(_id, update, auditDetails);
    }
  }
  return facilities;
};

/*
  If facility has been changed to issued (after first submission)
  When submitting to UKEF, have to remove the canResubmitIssuedFacilities flag
  Ensures that cannot update this facility anymore
*/
const updateChangedToIssued = async (dealId, auditDetails) => {
  const facilities = await getAllFacilitiesByDealId(dealId);
  await Promise.all(
    facilities
      .filter(({ canResubmitIssuedFacilities }) => canResubmitIssuedFacilities)
      .map(async ({ _id }) => {
        const update = {
          canResubmitIssuedFacilities: false,
        };

        return updateFacility(_id, update, auditDetails);
      }),
  );
};

/**
 * Adds UKEF facility ID to facilities.
 *
 * @param {string} dealId - The ID of the deal.
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<Array>} - A promise that resolves to an array of facilities.
 * @throws {Error} - If unable to generate facility ID.
 */
const addUkefFacilityIdToFacilities = async (dealId, auditDetails) => {
  const facilities = await getAllFacilitiesByDealId(dealId);

  await Promise.all(
    facilities.map(async (facility) => {
      if (!facility.ukefFacilityId) {
        const { maskedId } = await generateUkefId(CONSTANTS.NUMBER.ENTITY_TYPE.FACILITY, facility);
        const update = {
          ukefFacilityId: maskedId,
        };

        await updateFacility(facility._id, update, auditDetails);
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
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<boolean>} Facility(ies) was(were) updated or not
 */
const checkCoverDateConfirmed = async (app, auditDetails) => {
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
            await updateFacility(f._id, { coverDateConfirmed: Boolean(isAIN) }, auditDetails);
          });

        // Iterate through unissued facilities
        facilities
          .filter((f) => !f.hasBeenIssued && f.coverDateConfirmed)
          .map(async (f) => {
            hasUpdated = true;
            await updateFacility(f._id, { coverDateConfirmed: false }, auditDetails);
          });
        return hasUpdated;
      }
    } catch (error) {
      console.error('Unable to set coverDateConfirmed for AIN facilities. %o', error);
    }
  }
  return hasUpdated;
};

/**
 * Adds submission data to an existing application.
 * @param {string} dealId - The ID of the deal.
 * @param {Object} existingApplication - An object representing the existing application.
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<Object>} - An object containing the submission count, submission date, portal activities, and UKEF deal ID.
 */
const addSubmissionData = async (dealId, existingApplication, auditDetails) => {
  await checkCoverDateConfirmed(existingApplication, auditDetails);
  await addSubmissionDateToIssuedFacilities(dealId, auditDetails);

  const { count, date } = await generateSubmissionData(existingApplication);
  const updatedPortalActivity = await submissionPortalActivity(existingApplication);

  if (existingApplication.submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    await updateChangedToIssued(dealId, auditDetails);
  }

  const submissionData = {
    submissionCount: count,
    submissionDate: date,
    portalActivities: updatedPortalActivity,
  };

  if (!existingApplication.ukefDealId) {
    const { maskedId } = await generateUkefId(CONSTANTS.NUMBER.ENTITY_TYPE.DEAL, existingApplication);
    submissionData.ukefDealId = maskedId;
  }

  await addUkefFacilityIdToFacilities(dealId, auditDetails);

  return submissionData;
};

module.exports = {
  generateId,
  generateUkefId,
  addSubmissionData,
  submissionPortalActivity,
  addSubmissionDateToIssuedFacilities,
  updateChangedToIssued,
  checkCoverDateConfirmed,
};
