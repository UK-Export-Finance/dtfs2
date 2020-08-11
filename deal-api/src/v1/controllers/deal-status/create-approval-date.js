const $ = require('mongo-dot-notation');
const now = require('../../../now');

const createApprovalDate = async (collection, _id, user) => {
  const approvalDate = {
    details: {
      approvalDate: now(),
      checker: user,
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(approvalDate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = createApprovalDate;
