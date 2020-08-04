
const xml2js = require('xml2js');
const dealController = require('../deal.controller');
const dealCommentsController = require('../deal-comments.controller');
const { generateStatus } = require('./type-b-helpers');
const statusUpdateController = require('../deal-status.controller');

const updateStatus = statusUpdateController.update;
const interfaceUser = {
  username: 'INTERFACE',
  firstname: 'K2',
  surname: 'INTERFACE',
  roles: ['interface'],
  bank: { id: '*' },
};

const updateStatusViaController = (dealId, user, body) => new Promise((resolve, reject) => {
  const fakeRequestThisHurtsMySoul = {
    params: {
      id: dealId,
    },
    user,
    body,
  };

  const fakeResponseThisHurtsMore = {
    status: (statusCode) => ({
      send: (message) => {
        if (statusCode === 200) {
          resolve(message);
        } else {
          reject(message);
        }
      },
    }),
  };

  return updateStatus(fakeRequestThisHurtsMySoul, fakeResponseThisHurtsMore);
});

const processTypeB = async ({ fileContents }) => {
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return { error };
  }

  const { portal_deal_id: dealId } = workflowDeal.$;

  const deal = await dealController.findOneDeal(dealId);

  if (!deal) {
    return false;
  }

  const { Deal_comments: dealComments = [] } = workflowDeal;
  const { Action_Code: actionCode } = workflowDeal.$;

  if (actionCode === '007' && dealComments.length) {
    return dealCommentsController.addSpecialConditions(dealId, dealComments[0], interfaceUser);
  }

  const updateData = {
    comments: dealComments.length ? dealComments[0] : '',
    status: generateStatus(deal, workflowDeal),
    ukefDealId: workflowDeal.UKEF_deal_id[0],
  };

  const result = await updateStatusViaController(dealId, interfaceUser, updateData);
  return result;
  const bondTransactionItems = deal.bondTransactions.items.map((bond) => {
    const workflowBondDetails = workflowDeal.BSSFacilities.find(
      (b) => b.BSS_portal_facility_id[0] === bond._id, // eslint-disable-line no-underscore-dangle
    );

    return {
      ...bond,
      ukefFacilityID: workflowBondDetails && workflowBondDetails.BSS_ukef_facility_id,
    };
  });

  const loanTransactionItems = deal.loanTransactions.items.map((loan) => {
    const workflowLoanDetails = workflowDeal.EWCSFacilities.find(
      (b) => b.EWCS_portal_facility_id[0] === loan._id, // eslint-disable-line no-underscore-dangle
    );

    return {
      ...loan,
      ukefFacilityID: workflowLoanDetails && workflowLoanDetails.EWCS_ukef_facility_id,
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
