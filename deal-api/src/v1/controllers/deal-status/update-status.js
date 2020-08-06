const $ = require('mongo-dot-notation');
const now = require('../../../now');

const updateStatus = async (collection, _id, from, to) => {
  const allowedpreviousWorkflowStatus = ['draft', 'approved_conditions', 'approved', 'submission_acknowledged', 'confirmation_acknowledged'];

  const statusUpdate = {
    details: {
      status: to,
      previousStatus: from,
      dateOfLastAction: now(),
    },
  };

  if (from && allowedpreviousWorkflowStatus.includes(from.toLowerCase())) {
    statusUpdate.details.previousWorkflowStatus = from;
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
