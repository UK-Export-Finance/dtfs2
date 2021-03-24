const mapDeal = require('../mappings/map-deal');

const api = require('../api');
const allPartiesHaveUrn = require('../helpers/checkIfAllPartiesHaveUrn');
const { createACBS } = require('./acbs.controller');

const findOneDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return {
    ...deal,
    dealSnapshot: await mapDeal(deal.dealSnapshot),
  };
};
exports.findOneDeal = findOneDeal;

const findOnePortalDeal = async (dealId) => {
  const deal = await api.findOnePortalDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return deal;
};
exports.findOnePortalDeal = findOnePortalDeal;

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, partyUpdate);

  const allRequiredPartiesHaveUrn = allPartiesHaveUrn(updatedDeal.tfm.parties);

  if (allRequiredPartiesHaveUrn) {
    // Start ACBS process
    const acbsFunctionUris = await createACBS(updatedDeal);
    console.log({ acbsFunctionUris });
  }
  return updatedDeal.tfm;
};
exports.updateTfmParty = updateTfmParty;

const updateTfmCreditRating = async (dealId, exporterCreditRating) => {
  const creditRatingUpdate = {
    tfm: {
      exporterCreditRating,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, creditRatingUpdate);

  return updatedDeal.tfm;
};
exports.updateTfmCreditRating = updateTfmCreditRating;
