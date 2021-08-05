const now = require('../../../now');
const refDataApi = require('../../../reference-data/api');
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

const generateId = async (entityType) => refDataApi.numberGenerator.create(entityType);

const generateUkefDealId = async (application) => application.ukefDealId || generateId('deal');

const generateUkefFacilityId = async (facility) => facility.ukefFacilityId || generateId('facility');

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
    const ukefFacilityId = await generateUkefFacilityId(facility);

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
  const ukefDealId = await generateUkefDealId(existingApplication);

  await addSubmissionDateToIssuedFacilities(applicationId);
  await addUkefFacilityIdToFacilities(applicationId);

  return {
    submissionCount: count,
    submissionDate: date,
    ukefDealId,
  };
};

module.exports = addSubmissionData;
