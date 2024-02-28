const now = require('../../../now');
const { numberGenerator } = require('../../../external-api/api');
const {
  getAllFacilitiesByDealId,
  update: updateFacility,
} = require('./facilities.controller');
const {
  ukefSubmissionPortalActivity,
  facilityChangePortalActivity,
} = require('./portal-activities.controller');

const CONSTANTS = require('../../../constants');

const generateSubmissionData = async (existingApplication) => {
  const result = {
    date: existingApplication.submissionDate,
  };

  result.count = existingApplication.submissionCount + 1;

  if (!existingApplication.submissionDate) {
    result.date = now();
  }

  return result;
};

const generateId = async ({
  entityId, entityType, dealId, user,
}) => numberGenerator.get({
  dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  entityId,
  entityType,
  dealId,
  user,
});

const generateUkefDealId = async (application) => generateId({
  entityId: application._id,
  entityType: 'deal',
  dealId: application._id,
  user: application.checkerId,
});

const generateUkefFacilityId = async (facility) => generateId({
  entityId: facility._id,
  entityType: 'facility',
  dealId: facility.dealId,
});

const addSubmissionDateToIssuedFacilities = async (dealId) => {
  const facilities = await getAllFacilitiesByDealId(dealId);
  // eslint-disable-next-line no-restricted-syntax
  for (const facility of facilities) {
    const {
      _id, hasBeenIssued, canResubmitIssuedFacilities, shouldCoverStartOnSubmission, issueDate, hasBeenIssuedAndAcknowledged
    } = facility;
    /**
     * checks if hasBeenIssued and if not hasBeenIssuedAndAcknowledged
     * ensures that once submitted to UKEF, the coverStartDate is not overwritten to the new resubmission date
     */
    if (hasBeenIssued && !hasBeenIssuedAndAcknowledged) {
      const update = {
        submittedAsIssuedDate: now(),
      };
      /**
       * if canResubmitIssuedFacilities and shouldCoverStartOnSubmission is true
       * sets coverStartDate to issueDate
       * else if not canResubmitIssuedFacilities then set on submission to UKEF date
       * sets hour, min, seconds to midnight of the same day
       */
      if (shouldCoverStartOnSubmission) {
        if (canResubmitIssuedFacilities) {
          update.coverStartDate = (new Date(issueDate)).setHours(0, 0, 0, 0);
        } else {
          update.coverStartDate = (new Date()).setHours(0, 0, 0, 0);
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

  await Promise.all(facilities.map(async (facility) => {
    if (!facility.ukefFacilityId) {
      const { ukefId } = await generateUkefFacilityId(facility);
      const update = {
        ukefFacilityId: ukefId,
      };
      await updateFacility(facility._id, update);
    }
  }));

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
        facilities.filter((f) => f.hasBeenIssued && !f.coverDateConfirmed).map(async (f) => {
          hasUpdated = true;
          await updateFacility(f._id, {
            coverDateConfirmed: Boolean(isAIN),
          });
        });

        // Iterate through unissued facilities
        facilities.filter((f) => !f.hasBeenIssued && f.coverDateConfirmed).map(async (f) => {
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
    const { ukefId } = await generateUkefDealId(existingApplication);
    submissionData.ukefDealId = ukefId;
  }

  return submissionData;
};

module.exports = {
  addSubmissionData,
  submissionPortalActivity,
  addSubmissionDateToIssuedFacilities,
  updateChangedToIssued,
  checkCoverDateConfirmed,
};
