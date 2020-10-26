const $ = require('mongo-dot-notation');
const now = require('../../../now');

const updateStatus = async (collection, _id, from, to) => {
  const statusUpdate = {
    details: {
      status: to,
      dateOfLastAction: now(),
    },
  };


  if (from !== to) {
    statusUpdate.details.previousStatus = from;
  }

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(statusUpdate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = updateStatus;
