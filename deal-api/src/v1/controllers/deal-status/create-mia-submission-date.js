const $ = require('mongo-dot-notation');
const now = require('../../../now');

const createMiaSubmissionDate = async (collection, _id) => {
  const submissionDate = {
    details: {
      manualInclusionApplicationSubmissionDate: now(),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(submissionDate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = createMiaSubmissionDate;
