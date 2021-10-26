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

const identifyDealParties = (deal) => ({
  hasExporter: Boolean(deal.exporter.companyName),
  hasBuyer: Boolean(deal.buyer && deal.buyer.name),
  hasIndemnifier: Boolean(deal.indemnifier && deal.indemnifier.name),
  hasAgent: Boolean(deal.eligibility && deal.eligibility.agentName),
});

const addPartyUrns = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    hasExporter, hasIndemnifier, hasAgent, hasBuyer,
  } = identifyDealParties(deal);

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      parties: {
        exporter: {
          partyUrn: await getPartyUrn({ companyRegNo: deal.exporter.companiesHouseRegistrationNumber }),
          partyUrnRequired: hasExporter,
        },
        buyer: {
          partyUrn: deal.buyer ? deal.buyer.name : '',
          partyUrnRequired: hasBuyer,
        },
        indemnifier: {
          partyUrn: deal.indemnifier ? deal.indemnifier.name : '',
          partyUrnRequired: hasIndemnifier,
        },
        agent: {
          partyUrn: deal.eligibility ? deal.eligibility.agentName : '',
          partyUrnRequired: hasAgent,
        },
      },
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(deal._id, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};
exports.addPartyUrns = addPartyUrns;
