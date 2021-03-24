const { updateTfmCreditRating } = require('../../v1/controllers/deal.controller');

const updateCreditRating = async ({ dealId, creditRatingUpdate }) => {
  const { exporterCreditRating } = creditRatingUpdate;
  const update = await updateTfmCreditRating(dealId, exporterCreditRating);
  return update;
};

module.exports = updateCreditRating;
