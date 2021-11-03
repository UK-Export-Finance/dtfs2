const { updateTfmActivityComment } = require('../../v1/controllers/deal.controller');

const updateActivityComment = async ({ dealId, commentUpdate }) => {
  const update = updateTfmActivityComment(dealId, commentUpdate);
  return update;
};

module.exports = updateActivityComment;
