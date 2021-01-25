const api = require('../api');

const addPartyURN = async (deal) => {
  if (!deal) {
    return false;
  }
  const companyRegNo = deal.submissionDetails['supplier-companies-house-registration-number'];

  if (!companyRegNo) {
    return false;
  }

  const partyDbInfo = await api.getPartyDbInfo({ companyRegNo });

  if (!partyDbInfo) {
    return false;
  }

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      partyUrn: partyDbInfo[0].partyUrn,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(deal._id, dealUpdate);
  return updatedDeal;
};
exports.addPartyURN = addPartyURN;
