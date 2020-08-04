const $ = require('mongo-dot-notation');
const now = require('../../../now');

const createSubmissionDate = async (collection, _id, user) => {
  const submissionDate = {
    details: {
      submissionDate: now(),
      checker: user,
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

module.exports = createSubmissionDate;
