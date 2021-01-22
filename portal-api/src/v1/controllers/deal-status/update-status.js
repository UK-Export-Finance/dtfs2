const { updateDeal } = require('../deal.controller');
const now = require('../../../now');

const updateStatus = async (dealId, from, to) => {
  const modifiedDeal = {
    details: {
      status: to,
      dateOfLastAction: now(),
    },
  };

  if (from !== to) {
    modifiedDeal.details.previousStatus = from;
  }

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
  );

  return updatedDeal;
};

module.exports = updateStatus;
