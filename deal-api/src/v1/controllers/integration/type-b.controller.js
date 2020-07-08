
const xml2js = require('xml2js');
const dealController = require('../deal.controller');
const { k2Map } = require('./helpers');

const processTypeB = async ({ fileContents }) => {
  const { Deal: deal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return {
      error,
    };
  }

  const { portal_deal_id: dealId } = deal.$;

  const updatedDealInfo = {
    details: {
      status: k2Map.findPortalValue('DEAL', 'STATUS', deal.Deal_status[0]),
      ukefDealId: deal.UKEF_deal_id[0],
    },
  };

  const updateRequest = {
    params: {
      id: dealId,
    },
    body: updatedDealInfo,
  };

  const updatedDeal = await dealController.updateDeal(updateRequest);
  return updatedDeal;
};

module.exports = {
  processTypeB,
};
