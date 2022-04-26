const { findOneDeal, updateDeal } = require('./deal.controller');

const { addComment } = require('./deal-comments.controller');

const { userHasAccessTo } = require('../users/checks');

const validateStateChange = require('../validation/deal-status');

const userCanSubmitDeal = require('./deal-status/user-can-submit-deal');
const updateStatus = require('./deal-status/update-status');
const createSubmissionDate = require('./deal-status/create-submission-date');
const createMiaSubmissionDate = require('./deal-status/create-mia-submission-date');

const updateSubmissionCount = require('./deal-status/update-submission-count');

const sendStatusUpdateEmails = require('./deal-status/send-status-update-emails');
const createApprovalDate = require('./deal-status/create-approval-date');

const updateFacilityCoverStartDates = require('./deal-status/update-facility-cover-start-dates');
const updateIssuedFacilities = require('./deal-status/update-issued-facilities');
const updateSubmittedIssuedFacilities = require('./deal-status/update-submitted-issued-facilities');
const createUkefIds = require('./deal-status/create-ukef-ids');
const api = require('../api');

const CONSTANTS = require('../../constants');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      res.status(200).send(deal.status);
    }
  });
};

exports.update = (req, res) => {
  const { user } = req;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(req.user, deal)) return res.status(401).send();

    const fromStatus = deal.status;
    const toStatus = req.body.status;

    if (toStatus !== 'Ready for Checker\'s approval' && toStatus !== 'Abandoned') {
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

    const updatedDeal = await updateStatus(req.params.id, fromStatus, toStatus, user);

    const updatedDealStatus = updatedDeal.status;

    const shouldCheckFacilityDates = (fromStatus === 'Draft' && updatedDealStatus === 'Ready for Checker\'s approval');

    if (shouldCheckFacilityDates) {
      await updateFacilityCoverStartDates(req.user, updatedDeal);
    }

    let dealAfterAllUpdates = updatedDeal;

    if (req.body.comments) {
      dealAfterAllUpdates = await addComment(req.params.id, req.body.comments, user);
    }

    // only trigger updateDeal (which updates the deal's `editedBy` array),
    // if a checker is NOT changing the status to either:
    // `Maker input required` or 'Submitted'
    if (toStatus !== 'Further Maker\'s input required' && toStatus !== 'Submitted') {
      const dealAfterEditedByUpdate = await updateDeal(
        req.params.id,
        dealAfterAllUpdates,
        req.user,
      );
      dealAfterAllUpdates = dealAfterEditedByUpdate;
    }

    if (toStatus === 'Ready for Checker\'s approval') {
      const canUpdateIssuedFacilitiesCoverStartDates = true;
      const newIssuedFacilityStatus = 'Ready for check';

      dealAfterAllUpdates = await updateIssuedFacilities(
        req.user,
        fromStatus,
        dealAfterAllUpdates,
        canUpdateIssuedFacilitiesCoverStartDates,
        newIssuedFacilityStatus,
      );
    }

    if (toStatus === 'Further Maker\'s input required') {
      const canUpdateIssuedFacilitiesCoverStartDates = false;
      const newIssuedFacilityStatus = 'Maker\'s input required';

      dealAfterAllUpdates = await updateIssuedFacilities(
        req.user,
        fromStatus,
        dealAfterAllUpdates,
        canUpdateIssuedFacilitiesCoverStartDates,
        newIssuedFacilityStatus,
      );
    }

    if (toStatus === 'Submitted') {
      await updateSubmittedIssuedFacilities(req.user, dealAfterAllUpdates);

      dealAfterAllUpdates = await updateSubmissionCount(dealAfterAllUpdates, user);

      if (!dealAfterAllUpdates.details.submissionDate) {
        dealAfterAllUpdates = await createSubmissionDate(req.params.id, user);
      }

      if (dealAfterAllUpdates.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
        && !dealAfterAllUpdates.details.manualInclusionApplicationSubmissionDate) {
        dealAfterAllUpdates = await createMiaSubmissionDate(req.params.id, user);
      }

      // ensure that the deal is not migrated
      if (dealAfterAllUpdates.details.submissionCount === 1 && !Object.prototype.hasOwnProperty.call(dealAfterAllUpdates, 'dataMigration')) {
        dealAfterAllUpdates = await createUkefIds(
          req.params.id,
          dealAfterAllUpdates,
          user,
        );
      }

      await api.tfmDealSubmit(deal._id, CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS, req.user);
    }

    // check for approvals back from UKEF and date stamp it for countdown indicator
    if (toStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
      || toStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
      dealAfterAllUpdates = await createApprovalDate(req.params.id);
    }

    if (toStatus !== fromStatus) {
      await sendStatusUpdateEmails(dealAfterAllUpdates, fromStatus, req.user);
    }

    // make sure we have the latest deal in DB with bonds and loans populated
    const dealLatest = await findOneDeal(deal._id);

    return res.status(200).send(dealLatest);
  });
};
