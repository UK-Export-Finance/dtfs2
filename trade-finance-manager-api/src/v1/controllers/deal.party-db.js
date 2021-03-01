const api = require('../api');

const getPartyUrn = async ({ companyRegNo }) => {
  if (!companyRegNo) {
    return '';
  }

  const partyDbInfo = await api.getPartyDbInfo({ companyRegNo });
  if (!partyDbInfo) {
    return '';
  }

  return partyDbInfo[0].partyUrn;
};

const addPartyUrns = async (deal) => {
  if (!deal) {
    return false;
  }

  const { tfm = {} } = deal;
  const { parties = {} } = tfm;

  const {
    exporter,
  } = parties;

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      parties: {
        ...parties,
        exporter: {
          ...exporter,
          partyUrn: await getPartyUrn({ companyRegNo: deal.dealSnapshot.submissionDetails['supplier-companies-house-registration-number'] }),
        },
      },
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(deal._id, dealUpdate);
  return updatedDeal;
};
exports.addPartyUrns = addPartyUrns;
