const now = require('../../../now');
const {
  getAllFacilitiesByApplicationId,
  update: updateFacility,
} = require('./facilities.controller');

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

const generateUkefDealId = (application) => application.ukefDealId || 'PENDING UKEF ID';

const generateUkefFacilityId = (facility) => facility.ukefFacilityId || 'PENDING UKEF ID';

const addSubmissionDateToIssuedFacilities = async (applicationId) => {
  const facilities = await getAllFacilitiesByApplicationId(applicationId);

  facilities.forEach(async (facility) => {
    const { _id, hasBeenIssued } = facility;

    if (hasBeenIssued) {
      const update = {
        submittedAsIssuedDate: now(),
      };

      await updateFacility(_id, update);
    }
  });

  return facilities;
};

const addUkefFacilityIdToFacilities = async (applicationId) => {
  const facilities = await getAllFacilitiesByApplicationId(applicationId);

  facilities.forEach(async (facility) => {
    const ukefFacilityId = generateUkefFacilityId(facility);

    if (ukefFacilityId !== facility.ukefFacilityId) {
      const update = {
        ukefFacilityId,
      };
      updateFacility(facility._id, update);
    }
  });

  return facilities;
};


const addSubmissionData = async (applicationId, existingApplication) => {
  const { count, date } = await generateSubmissionData(existingApplication);
  const ukefDealId = generateUkefDealId(existingApplication);

  await addSubmissionDateToIssuedFacilities(applicationId);
  await addUkefFacilityIdToFacilities(applicationId);

  return {
    submissionCount: count,
    submissionDate: date,
    ukefDealId,
  };
};

module.exports = addSubmissionData;
