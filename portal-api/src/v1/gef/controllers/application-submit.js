const now = require('../../../now');
const refDataApi = require('../../../reference-data/api');
const {
  getAllFacilitiesByApplicationId,
  update: updateFacility,
} = require('./facilities.controller');
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
}) => refDataApi.numberGenerator.create({
  dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  entityId,
  entityType,
  dealId,
  user,
});

const generateUkefDealId = async (application) => application.ukefDealId || generateId({
  entityId: application._id,
  entityType: 'deal',
  dealId: application._id,
  user: application.checkerId,
});

const generateUkefFacilityId = async (facility) => facility.ukefDealId || generateId({
  entityId: facility._id,
  entityType: 'facility',
  dealId: facility.applicationId,
});


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

  await Promise.all(facilities.map(async (facility) => {
    const { ukefId } = await generateUkefFacilityId(facility);

    if (ukefId !== facility.ukefFacilityId) {
      const update = {
        ukefFacilityId: ukefId,
      };
      await updateFacility(facility._id, update);
    }
  }));

  return facilities;
};

const addSubmissionData = async (applicationId, existingApplication) => {
  const { count, date } = await generateSubmissionData(existingApplication);
  const { ukefId } = await generateUkefDealId(existingApplication);

  await addSubmissionDateToIssuedFacilities(applicationId);
  await addUkefFacilityIdToFacilities(applicationId);

  return {
    submissionCount: count,
    submissionDate: date,
    ukefDealId: ukefId,
  };
};

module.exports = addSubmissionData;
