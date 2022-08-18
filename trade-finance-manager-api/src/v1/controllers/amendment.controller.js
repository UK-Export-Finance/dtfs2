const api = require('../api');
const acbs = require('./acbs.controller');
const { createAmendmentTasks, updateAmendmentTasks } = require('../helpers/create-tasks-amendment.helper');
const { isRiskAnalysisCompleted } = require('../helpers/tasks');
const {
  amendmentEmailEligible,
  sendAutomaticAmendmentEmail,
  sendManualDecisionAmendmentEmail,
  sendManualBankDecisionEmail,
  canSendToAcbs,
  sendFirstTaskEmail,
  addLatestAmendmentValue,
  addLatestAmendmentDates,
  calculateUkefACBSExposure,
} = require('../helpers/amendment.helpers');

const sendAmendmentEmail = async (amendmentId, facilityId) => {
  try {
    const amendment = await api.getAmendmentById(facilityId, amendmentId);

    // if amendment exists and if automaticApprovalEmail field is present
    if (amendmentEmailEligible(amendment)) {
      const { dealSnapshot } = await api.findOneDeal(amendment.dealId);
      if (dealSnapshot) {
      // gets portal user to ensure latest details
        const user = await api.findPortalUserById(dealSnapshot.maker._id);

        // if automaticApprovalEmail and !automaticApprovalEmailSent (email not sent before)
        if (amendment?.automaticApprovalEmail && !amendment?.automaticApprovalEmailSent) {
          const automaticAmendmentVariables = { user, dealSnapshot, amendment, facilityId, amendmentId };
          // sends email and updates flag if sent
          await sendAutomaticAmendmentEmail(automaticAmendmentVariables);
        }
        if (amendment?.ukefDecision?.managersDecisionEmail && !amendment?.ukefDecision?.managersDecisionEmailSent) {
          // if managers decision email to be sent and not already sent
          const ukefDecisionAmendmentVariables = { user, dealSnapshot, amendment, facilityId, amendmentId };
          await sendManualDecisionAmendmentEmail(ukefDecisionAmendmentVariables);
        }
        if (amendment?.bankDecision?.banksDecisionEmail && !amendment?.bankDecision?.banksDecisionEmailSent) {
          const bankDecisionAmendmentVariables = { user, dealSnapshot, amendment, facilityId, amendmentId };
          await sendManualBankDecisionEmail(bankDecisionAmendmentVariables);
        }
        // if first amendment task email has not already been sent
        if (amendment?.sendFirstTaskEmail && !amendment?.firstTaskEmailSent) {
          const firstTaskVariables = { amendment, dealSnapshot, facilityId, amendmentId };
          await sendFirstTaskEmail(firstTaskVariables);
        }
      }
    }
  } catch (err) {
    console.error('Error sending amendment email', { err });
  }
};

// function to update tfm deals lastUpdated once amendment complete
const updateTFMDealLastUpdated = async (amendmentId, facilityId) => {
  const amendment = await api.getAmendmentById(facilityId, amendmentId);

  if (amendment?.dealId) {
    const { dealId } = amendment;
    const payload = {
      tfm: {
        lastUpdated: new Date().valueOf(),
      },
    };

    try {
      return api.updateDeal(dealId, payload);
    } catch (err) {
      console.error('Error updated tfm deal lastUpdated - amendment completed', { err });
      return null;
    }
  }

  return null;
};

const createAmendmentTFMObject = async (amendmentId, facilityId) => {
  try {
    const latestValue = await api.getLatestCompletedValueAmendment(facilityId);
    const latestCoverEndDate = await api.getLatestCompletedDateAmendment(facilityId);

    let tfmToAdd = {};

    tfmToAdd = await addLatestAmendmentValue(tfmToAdd, latestValue, facilityId);
    tfmToAdd = await addLatestAmendmentDates(tfmToAdd, latestCoverEndDate, facilityId);

    const payload = {
      tfm: tfmToAdd,
    };

    await api.updateFacilityAmendment(facilityId, amendmentId, payload);
    return tfmToAdd;
  } catch (error) {
    console.error('TFM-API - unable to add TFM object to amendment', { error });
    return null;
  }
};

const getAmendmentInProgress = async (req, res) => {
  const { facilityId } = req.params;
  const { data: amendment, status } = await api.getAmendmentInProgress(facilityId);
  if (status === 200) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get amendment in progress' });
};

const getCompletedAmendment = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getCompletedAmendment(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the completed amendment' });
};

const getLatestCompletedValueAmendment = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getLatestCompletedValueAmendment(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the latest completed value amendment' });
};

const getLatestCompletedDateAmendment = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getLatestCompletedDateAmendment(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the latest completed coverEndDate amendment' });
};

const getAmendmentById = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const amendment = await api.getAmendmentById(facilityId, amendmentId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendment by Id' });
};

const getAmendmentByFacilityId = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getAmendmentByFacilityId(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendment by facilityId' });
};

const getAmendmentsByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getAmendmentsByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendment by deal Id' });
};

const getAmendmentInProgressByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getAmendmentInProgressByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendment in progress by deal Id' });
};

const getCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getCompletedAmendmentByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the completed amendment by deal Id' });
};

const getLatestCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getLatestCompletedAmendmentByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the latest completed amendment by deal Id' });
};

const getAllAmendmentsInProgress = async (req, res) => {
  const amendment = await api.getAllAmendmentsInProgress();
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendments in progress' });
};

const createFacilityAmendment = async (req, res) => {
  const { facilityId } = req.body;
  const { amendmentId } = await api.createFacilityAmendment(facilityId);
  if (amendmentId) {
    return res.status(200).send({ amendmentId });
  }
  return res.status(422).send({ data: 'Unable to create amendment' });
};

const updateFacilityAmendment = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  let payload = req.body;
  // set to true if payload contains updateTfmLastUpdated else null
  const tfmLastUpdated = payload.updateTfmLastUpdated;

  /** Payload computation */
  // Tasks
  try {
    if (amendmentId && facilityId && payload) {
      if (payload.createTasks && payload.submittedByPim) {
        const tasks = createAmendmentTasks(payload.requireUkefApproval);
        payload.tasks = tasks;
        delete payload.createTasks;
        delete payload.requireUkefApproval;
      }

      if (payload?.taskUpdate?.updateTask) {
        const tasks = await updateAmendmentTasks(facilityId, amendmentId, payload.taskUpdate);
        payload.tasks = tasks;
        payload.ukefDecision = { isReadyForApproval: isRiskAnalysisCompleted(tasks) };
        delete payload.taskUpdate;
      }

      // delete so not part of amendment object
      if (tfmLastUpdated) {
        delete payload.updateTfmLastUpdated;
      }

      // UKEF exposure
      payload = calculateUkefACBSExposure(payload);

      // Update Amendment
      const createdAmendment = await api.updateFacilityAmendment(facilityId, amendmentId, payload);
      // sends email if conditions are met
      await sendAmendmentEmail(amendmentId, facilityId);

      if (createdAmendment && tfmLastUpdated) {
        await updateTFMDealLastUpdated(amendmentId, facilityId);
        await createAmendmentTFMObject(amendmentId, facilityId);
      }

      // Fetch facility object
      const facility = await api.findOneFacility(facilityId);
      // Fetch complete amendment object
      const amendment = await api.getAmendmentById(facilityId, amendmentId);
      // Fetch deal object from deal-tfm
      const tfmDeal = await api.findOneDeal(amendment.dealId);
      // Construct acceptable deal object

      const deal = {
        dealSnapshot: {
          dealType: tfmDeal.dealSnapshot.dealType,
          submissionType: tfmDeal.dealSnapshot.submissionType,
          submissionDate: tfmDeal.dealSnapshot.submissionDate,
        },
        exporter: {
          companyName: tfmDeal.dealSnapshot.exporter.companyName,
        },
      };

      // Amendment null & property existence check
      if (facility._id && amendment && tfmDeal.tfm) {
        // ACBS Interaction
        if (canSendToAcbs(amendment)) {
          acbs.amendAcbsFacility(amendment, facility, deal);
        }
      }

      if (createdAmendment) {
        return res.status(200).send(createdAmendment);
      }
    }
  } catch (e) {
    console.error('Unable to update amendment: ', { e });
    return res.status(400).send({ data: 'Unable to update amendment' });
  }

  return res.status(422).send({ data: 'Unable to update amendment' });
};

module.exports = {
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
  getCompletedAmendment,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAmendmentsByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
  getAllAmendmentsInProgress,
  sendAmendmentEmail,
  updateTFMDealLastUpdated,
  getLatestCompletedValueAmendment,
  getLatestCompletedDateAmendment,
};
