
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

  const bondTransactionItems = deal.bondTransactions.items.map((bond) => {
    const workflowBond = workflowDeal.BSSFacilities.find(
      (b) => b.BSS_portal_facility_id[0] === bond._id, // eslint-disable-line no-underscore-dangle
    );
    if (!workflowBond) {
      return bond;
    }

    const hasWorflowStatus = workflowBond.BSS_status && workflowBond.BSS_status.length;

    return {
      ...bond,
      ukefFacilityID: workflowBond.BSS_ukef_facility_id,
      // TODO: probably need better mapping here, TBD from future tickets...
      status: hasWorflowStatus && workflowBond.BSS_status[0] === 'Issued acknowledged' ? 'Acknowledged by UKEF' : workflowBond.BSS_status[0],
    };
  });

  const loanTransactionItems = deal.loanTransactions.items.map((loan) => {
    const workflowLoan = workflowDeal.EWCSFacilities.find(
      (b) => b.EWCS_portal_facility_id[0] === loan._id, // eslint-disable-line no-underscore-dangle
    );

    if (!workflowLoan) {
      return loan;
    }

    const hasWorflowStatus = workflowLoan.EWCS_status && workflowLoan.EWCS_status.length;

    return {
      ...loan,
      ukefFacilityID: workflowLoan.EWCS_ukef_facility_id,
      // TODO: probably need better mapping here, TBD from future tickets...
      status: hasWorflowStatus && workflowLoan.EWCS_status[0] === 'Issued acknowledged' ? 'Acknowledged by UKEF' : workflowLoan.EWCS_status[0],
    };
  });

  const updatedDealInfo = {
    details: {
      ukefDealId: workflowDeal.UKEF_deal_id[0],
      previousWorkflowStatus: workflowDeal.Deal_status[0],
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
    status: generateStatus(deal, workflowDeal),
  };

  const result = await updateStatusViaController(dealId, interfaceUser, updateData);
  return result;
};

module.exports = {
  processTypeB,
};
