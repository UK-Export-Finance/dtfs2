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

const addSubmissionData = async (applicationId, existingApplication) => {
  const { count, date } = await generateSubmissionData(existingApplication);

  await addSubmissionDateToIssuedFacilities(applicationId);

  return {
    submissionCount: count,
    submissionDate: date,
  };
};

module.exports = addSubmissionData;
