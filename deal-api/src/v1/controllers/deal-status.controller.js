const { findOneDeal, updateDeal } = require('./deal.controller');
const { addComment } = require('./deal-comments.controller');

const { userHasAccessTo } = require('../users/checks');
const db = require('../../drivers/db-client');

const { createTypeA } = require('./integration/k2-messages');
const validateStateChange = require('../validation/deal-status');

const userCanSubmitDeal = require('./deal-status/user-can-submit-deal');
const updateStatus = require('./deal-status/update-status');
const createSubmissionDate = require('./deal-status/create-submission-date');
const sendStatusUpdateEmails = require('./deal-status/send-status-update-emails');
const createApprovalDate = require('./deal-status/create-approval-date');

const updateFacilityDates = require('./deal-status/update-facility-dates');
const updateIssuedFacilities = require('./deal-status/update-issued-facilities');
const updateSubmittedIssuedFacilities = require('./deal-status/update-submitted-issued-facilities');
const CONSTANTS = require('../../constants');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      res.status(200).send(deal.details.status);
    }
  });
};

exports.update = (req, res) => {
  const { user } = req;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(req.user, deal)) return res.status(401).send();

    const fromStatus = deal.details.status;
    const toStatus = req.body.status;


    if (toStatus !== 'Ready for Checker\'s approval'
        && toStatus !== 'Abandoned Deal') {
      if (!userCanSubmitDeal(deal, req.user)) {
        return res.status(401).send();
      }
    }

    const validationErrors = validateStateChange(deal, req.body, user);

    if (validationErrors) {
      return res.status(200).send({
        success: false,
        ...validationErrors,
      });
    }

    const collection = await db.getCollection('deals');
    const updatedDeal = await updateStatus(collection, req.params.id, fromStatus, toStatus);
    const updatedDealStatus = updatedDeal.details.status;

    const shouldCheckFacilityDates = (fromStatus === 'Draft' && updatedDealStatus === 'Ready for Checker\'s approval');
    if (shouldCheckFacilityDates) {
      await updateFacilityDates(collection, updatedDeal);
    }

    let dealAfterAllUpdates = updatedDeal;

    if (req.body.comments) {
      dealAfterAllUpdates = await addComment(req.params.id, req.body.comments, user);
    }

    // only trigger updateDeal (which updates the deal's `editedBy` array),
    // if a checker is NOT changing the status to either:
    // `Maker input required` or 'Submitted'
    if (toStatus !== 'Further Maker\'s input required'
        && toStatus !== 'Submitted') {
      const newReq = {
        params: req.params,
        body: dealAfterAllUpdates,
        user: req.user,
      };

      const dealAfterEditedByUpdate = await updateDeal(newReq);
      dealAfterAllUpdates = dealAfterEditedByUpdate;
    }

    if (toStatus === 'Ready for Checker\'s approval') {
      const updateAllIssuedFacilities = false;
      const updateIssuedFacilitiesCoverStartDates = true;
      // TODO rename to updateIssuedFacilities
      dealAfterAllUpdates = await updateIssuedFacilities(collection, dealAfterAllUpdates, 'Ready for check', updateAllIssuedFacilities, updateIssuedFacilitiesCoverStartDates);
    }

    if (toStatus === 'Further Maker\'s input required') {
      const updateAllIssuedFacilities = true;
      // TODO rename to updateIssuedFacilities
      dealAfterAllUpdates = await updateIssuedFacilities(collection, dealAfterAllUpdates, 'Maker\'s input required', updateAllIssuedFacilities);
    }

    if (toStatus === 'Submitted') {
      await updateSubmittedIssuedFacilities(collection, dealAfterAllUpdates);
      dealAfterAllUpdates = await createSubmissionDate(collection, req.params.id, user);

      // TODO - Reinstate typeA XML creation once Loans and Summary have been added
      const { previousWorkflowStatus } = deal.details;

      const typeA = await createTypeA(dealAfterAllUpdates, previousWorkflowStatus);

      if (typeA.errorCount) {
        // Revert status
        await updateStatus(collection, req.params.id, toStatus, fromStatus);
        return res.status(200).send(typeA);
      }

      if (
        ['approved', 'approved_conditions'].includes(dealAfterAllUpdates.details.previousWorkflowStatus)
        && dealAfterAllUpdates.details.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      ) {
        // Must be confirming acceptance of MIA so change to MIN
        const minUpdateReq = {
          params: req.params,
          body: {
            details: {
              submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
            },
          },
          user: req.user,
        };

        await updateDeal(minUpdateReq);
      }
    }
    // check for approvals back from UKEF and date stamp it for countdown indicator
    if (toStatus === CONSTANTS.DEAL.STATUS.APPROVED
      || toStatus === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS) {
      dealAfterAllUpdates = await createApprovalDate(collection, req.params.id);
    }

    await sendStatusUpdateEmails(dealAfterAllUpdates, fromStatus, req.user);

    return res.status(200).send(dealAfterAllUpdates);
  });
};
