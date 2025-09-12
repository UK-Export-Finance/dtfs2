const { updateDeal } = require('../deal.controller');

const updateStatus = async (dealId, from, to, auditDetails) => {
  const dealUpdate = {
    updatedAt: Date.now(),
    status: to,
  };

  if (from !== to) {
    dealUpdate.previousStatus = from;
  }

  const updatedDeal = await updateDeal({ dealId, dealUpdate, auditDetails });

  return updatedDeal;
};

module.exports = updateStatus;
