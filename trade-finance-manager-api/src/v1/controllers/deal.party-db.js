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
          partyUrn: '',
          partyUrnRequired: hasBuyer,
        },
        indemnifier: {
          partyUrn: '',
          partyUrnRequired: hasIndemnifier,
        },
        agent: {
          partyUrn: '',
          partyUrnRequired: hasAgent,
        },
      },
    },
  };

  const updatedDeal = await api.updateDeal(deal._id, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};
exports.addPartyUrns = addPartyUrns;
