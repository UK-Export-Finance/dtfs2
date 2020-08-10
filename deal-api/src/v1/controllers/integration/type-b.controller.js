
const xml2js = require('xml2js');
const dealController = require('../deal.controller');
const dealCommentsController = require('../deal-comments.controller');
const {
  generateStatus,
  updateBonds,
  updateLoans,
} = require('./type-b-helpers');
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

const shouldCheckIssuedFacilities = (dealStatus, dealSubmissionType) => {
  const allowedDealStatus = dealStatus === 'Acknowledged by UKEF';
  const allowedDealSubmissionType = (dealSubmissionType === 'Automatic Inclusion Notice' || dealSubmissionType === 'Manual Inclusion Notice');
  if (allowedDealStatus && allowedDealSubmissionType) {
    return true;
  }

  return false;
};

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

  const dealStatus = generateStatus(deal, workflowDeal);
  const dealSubmissionType = deal.details.submissionType;
  const checkIssueFacilities = shouldCheckIssuedFacilities(dealStatus, dealSubmissionType);

  const updatedDealInfo = {
    details: {
      ukefDealId: workflowDeal.UKEF_deal_id[0],
      previousWorkflowStatus: workflowDeal.Deal_status[0],
    },
    bondTransactions: {
      items: updateBonds(deal.bondTransactions.items, workflowDeal, checkIssueFacilities),
    },
    loanTransactions: {
      items: updateLoans(deal.loanTransactions.items, workflowDeal, checkIssueFacilities),
    },
  };

  const updateRequest = {
    params: {
      id: dealId,
    },
    user: interfaceUser,
    body: updatedDealInfo,
  };

  await dealController.updateDeal(updateRequest);

  const { Deal_comments: dealComments = [] } = workflowDeal;
  const { Action_Code: actionCode } = workflowDeal.$;

  if (actionCode === '007' && dealComments.length) {
    await dealCommentsController.addSpecialConditions(dealId, dealComments[0], interfaceUser);
  } else {
    await dealCommentsController.addComment(dealId, dealComments[0], interfaceUser);
  }

  const updateData = {
    status: dealStatus,
  };

  const result = await updateStatusViaController(dealId, interfaceUser, updateData);
  return result;
};

module.exports = {
  processTypeB,
};
