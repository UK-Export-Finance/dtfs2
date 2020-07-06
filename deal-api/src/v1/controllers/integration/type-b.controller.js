
const xml2js = require('xml2js');
const { updateDeal } = require('../deal.controller');
const { k2Map } = require('./helpers');

const processTypeB = async ({ fileContents }) => {
  console.log({ fileContents });
  const { Deal: deal } = await xml2js.parseStringPromise(fileContents /* , options */);
  const { portal_deal_id: dealId } = deal.$;

  const xmlAttributes = deal.$;

  const updatedDealInfo = {
    details: {
      status: k2Map.findPortalValue('DEAL', 'STATUS', deal.Deal_status[0]),
    },
  };

  const updateRequest = {
    params: {
      id: '1000294', // dealId,
    },
    body: updatedDealInfo,
  };

  const updatedDeal = await updateDeal(updateRequest);

  console.log({ deal: JSON.stringify(deal, null, 4) });
};

module.exports = {
  processTypeB,
};
