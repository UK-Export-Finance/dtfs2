// NOTE: Workflow integration has been disabled and replaced with TFM integration.
// Leaving this code here just incase we need to re-enable.
// const xml2js = require('xml2js');
const xml2js = { parseStringPromise: () => {} };

const dealController = require('../deal.controller');
const dealCommentsController = require('../deal-comments.controller');
const {
  generateStatus,
  updateFacilities,
} = require('./type-b-helpers');
const statusUpdateController = require('../deal-status.controller');
const CONSTANTS = require('../../../constants');

const updateStatus = statusUpdateController.update;
const interfaceUser = {
  username: 'DigitalService.TradeFinance@ukexportfinance.gov.uk',
  firstname: 'UKEF',
  surname: '',
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
  const acceptedByUkefDealStatus = (dealStatus === 'Accepted by UKEF (with conditions)'
                                  || dealStatus === 'Accepted by UKEF (without conditions)');

  const allowedDealStatus = (dealStatus === 'Acknowledged by UKEF' || acceptedByUkefDealStatus);

  const allowedDealSubmissionType = (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                    || dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const isMiaDealInApprovedStatus = (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
                                    && acceptedByUkefDealStatus);

  const shouldCheck = ((allowedDealStatus && allowedDealSubmissionType)
                      || isMiaDealInApprovedStatus);

  if (shouldCheck) {
    return true;
  }

  return false;
};

const processTypeB = async ({ filename, fileContents }) => {
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return { filename, error, success: false };
  }

  const { portal_deal_id: dealId } = workflowDeal.$;

  const deal = await dealController.findOneDeal(dealId);

  if (!deal) {
    return {
      filename,
      success: false,
    };
  }

  const dealStatus = generateStatus(deal, workflowDeal);
  const dealSubmissionType = deal.submissionType;
  const checkIssueFacilities = shouldCheckIssuedFacilities(dealStatus, dealSubmissionType);

  const updatedDealInfo = {
    details: {
      ukefDealId: workflowDeal.UKEF_deal_id[0],
      previousWorkflowStatus: workflowDeal.Deal_status[0],
    },
  };

  if (checkIssueFacilities) {
    updateFacilities(deal.facilities, dealId, workflowDeal, interfaceUser, checkIssueFacilities);
  }

  await dealController.updateDeal(
    dealId,
    updatedDealInfo,
    interfaceUser,
  );

  const { Deal_comments: dealComments = [] } = workflowDeal;
  const { Action_Code: actionCode } = workflowDeal.$;

  if (dealComments.length) {
    if (actionCode === '007') {
      await dealCommentsController.addUkefDecision(dealId, dealComments[0], interfaceUser);
    } else {
      await dealCommentsController.addUkefComment(dealId, dealComments[0], interfaceUser);
    }
  }

  const updateData = {
    status: dealStatus,
  };

  const updatedDeal = await updateStatusViaController(dealId, interfaceUser, updateData);

  return {
    filename,
    success: Boolean(updatedDeal),
    updatedDeal,
  };
};

module.exports = {
  processTypeB,
};
