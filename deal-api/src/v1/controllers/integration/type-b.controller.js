
const xml2js = require('xml2js');
const dealController = require('../deal.controller');


const { generateStatus, updateComments } = require('./type-b-helpers');

const processTypeB = async ({ fileContents }) => {
  console.log('type-b.controller :: processTypeB');
  console.log(fileContents);
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return {
      error,
    };
  }


  const { portal_deal_id: dealId } = workflowDeal.$;

  console.log(`lookup deal on id = ${dealId}`);

  const deal = await dealController.findOneDeal(dealId);
  if (!deal) {
    return false;
  }

  console.log(`found deal : \n${JSON.stringify(deal, null, 2)}`);

  const updatedDealInfo = {
    details: {
      status: generateStatus(deal, workflowDeal),
      ukefDealId: workflowDeal.UKEF_deal_id[0],
    },
  };

  const updateRequest = {
    params: {
      id: dealId,
    },
    body: updatedDealInfo,
  };

  console.log(`updateRequest : \n${JSON.stringify(updateRequest, null, 2)}`);


  await updateComments(dealId, workflowDeal);
  const updatedDeal = await dealController.updateDeal(updateRequest);

  return updatedDeal;
};

module.exports = {
  processTypeB,
};
