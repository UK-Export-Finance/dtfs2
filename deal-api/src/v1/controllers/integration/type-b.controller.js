
const xml2js = require('xml2js');
const dealController = require('../deal.controller');


const { generateStatus } = require('./type-b-helpers');
const { updateStatus } = require('./internal-api');

const processTypeB = async ({ fileContents }) => {
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return {
      error,
    };
  }

  const { portal_deal_id: dealId } = workflowDeal.$;

  const deal = await dealController.findOneDeal(dealId);
  if (!deal) {
    return false;
  }

  // // const updatedDealInfo = {
  // //   details: {
  // //     status: generateStatus(deal, workflowDeal),
  // //     ukefDealId: workflowDeal.UKEF_deal_id[0],
  // //   },
  // // };
  // //
  // const updateRequest = {
  //   params: {
  //     id: dealId,
  //   },
  //   body: updatedDealInfo,
  // };
  // console.log(`updateRequest : \n${JSON.stringify(updateRequest, null, 2)}`);
  //
  // await updateComments(dealId, workflowDeal);

  const { Deal_comments: dealComments = [] } = workflowDeal;
  const { Action_Code: actionCode } = workflowDeal.$;

  const user = {username:'INTERFACE', password:'INTERFACE'};

  if (dealComments.length) {
      if (actionCode === '007') {
        //TODO
        // await dealCommentsController.addSpecialConditions(dealId, dealComments[0], user);
      } else {
        // await dealCommentsController.addComment(dealId, dealComments[0], user);
        const updateData = {
          comments: dealComments[0],
          status: generateStatus(deal, workflowDeal),
          ukefDealId: workflowDeal.UKEF_deal_id[0],
        };

        await updateStatus(user, dealId, updateData);
      }
    }
  };


module.exports = {
  processTypeB,
};
