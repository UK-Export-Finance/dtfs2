
const xml2js = require('xml2js');
const dealController = require('../deal.controller');
const { generateStatus, updateComments } = require('./type-b-helpers');

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

  const bondTransactionItems = deal.bondTransactions.items.map((bond) => {
    const workflowBondDetails = workflowDeal.BSSFacilities.find(
      (b) => b.BSS_portal_facility_id[0] === bond._id, // eslint-disable-line no-underscore-dangle
    );

    return {
      ...bond,
      ukefFacilityID: workflowBondDetails.BSS_ukef_facility_id,
    };
  });

  const loanTransactionItems = deal.loanTransactions.items.map((loan) => {
    const workflowLoanDetails = workflowDeal.EWCSFacilities.find(
      (b) => b.EWCS_portal_facility_id[0] === loan._id, // eslint-disable-line no-underscore-dangle
    );

    return {
      ...loan,
      ukefFacilityID: workflowLoanDetails.EWCS_ukef_facility_id,
    };
  });

  const updatedDealInfo = {
    details: {
      status: generateStatus(deal, workflowDeal),
      ukefDealId: workflowDeal.UKEF_deal_id[0],
    },
    bondTransactions: {
      items: bondTransactionItems,
    },
    loanTransactions: {
      items: loanTransactionItems,
    },
  };

  const updateRequest = {
    params: {
      id: dealId,
    },
    body: updatedDealInfo,
  };


  await updateComments(dealId, workflowDeal);
  const updatedDeal = await dealController.updateDeal(updateRequest);

  return updatedDeal;
};

module.exports = {
  processTypeB,
};
