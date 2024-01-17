const { updateDeal } = require('../deal.controller');

const updateStatus = async (dealId, from, to) => {
  const modifiedDeal = {
    updatedAt: Date.now(),
    status: to,
  };

  if (from !== to) {
    modifiedDeal.previousStatus = from;
  }

  const updatedDeal = await updateDeal(dealId, modifiedDeal);

  return updatedDeal;
};

module.exports = updateStatus;
