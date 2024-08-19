const { ObjectId } = require('mongodb');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { isTfmFacilityEndDateFeatureFlagEnabled, AMENDMENT_QUERIES } = require('@ukef/dtfs2-common');
const api = require('../api');
const acbs = require('./acbs.controller');
const { amendIssuedFacility } = require('./amend-issued-facility');
const { createAmendmentTasks, updateAmendmentTasks, getTasksAssignedToUserByGroup } = require('../helpers/create-tasks-amendment.helper');
const { isRiskAnalysisCompleted } = require('../helpers/tasks');
const {
  amendmentEmailEligible,
  sendAutomaticAmendmentEmail,
  sendManualDecisionAmendmentEmail,
  sendManualBankDecisionEmail,
  sendFirstTaskEmail,
  internalAmendmentEmail,
  canSendToAcbs,
  calculateAcbsUkefExposure,
  addLatestAmendmentValue,
  addLatestAmendmentCoverEndDate,
  addLatestAmendmentFacilityEndDate,
} = require('../helpers/amendment.helpers');
const CONSTANTS = require('../../constants');

const sendAmendmentEmail = async (amendmentId, facilityId, auditDetails) => {
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
          await sendAutomaticAmendmentEmail(automaticAmendmentVariables, auditDetails);
        }
        if (amendment?.ukefDecision?.managersDecisionEmail && !amendment?.ukefDecision?.managersDecisionEmailSent) {
          // if managers decision email to be sent and not already sent
          const ukefDecisionAmendmentVariables = { user, dealSnapshot, amendment, facilityId, amendmentId };
          await sendManualDecisionAmendmentEmail(ukefDecisionAmendmentVariables, auditDetails);
        }
        if (amendment?.bankDecision?.banksDecisionEmail && !amendment?.bankDecision?.banksDecisionEmailSent) {
          const bankDecisionAmendmentVariables = { user, dealSnapshot, amendment, facilityId, amendmentId };
          await sendManualBankDecisionEmail(bankDecisionAmendmentVariables, auditDetails);
        }
        // if first amendment task email has not already been sent
        if (amendment?.sendFirstTaskEmail && !amendment?.firstTaskEmailSent) {
          const firstTaskVariables = { amendment, dealSnapshot, facilityId, amendmentId };
          await sendFirstTaskEmail(firstTaskVariables, auditDetails);
        }
      }
    }
  } catch (error) {
    console.error('Error sending amendment email %o', error);
  }
};

// function to update tfm deals lastUpdated once amendment complete
const updateTFMDealLastUpdated = async (amendmentId, facilityId, auditDetails) => {
  const amendment = await api.getAmendmentById(facilityId, amendmentId);

  if (amendment?.dealId) {
    const { dealId } = amendment;
    const payload = {
      tfm: {
        lastUpdated: new Date().valueOf(),
      },
    };

    try {
      return api.updateDeal({ dealId, dealUpdate: payload, auditDetails });
    } catch (error) {
      console.error('Error updated tfm deal lastUpdated - amendment completed %o', error);
      return null;
    }
  }

  return null;
};

// creates tfm object in latest amendment with completed mapping for displaying amendment changes in tfm
const createAmendmentTFMObject = async (amendmentId, facilityId, auditDetails) => {
  try {
    // gets latest amendment value and dates
    const latestValueResponse = await api.getLatestCompletedAmendmentValue(facilityId);
    const latestCoverEndDateResponse = await api.getLatestCompletedAmendmentDate(facilityId);

    let tfmToAdd = {};
    // populates array with latest value/exposure and date/tenor values
    tfmToAdd = await addLatestAmendmentValue(tfmToAdd, latestValueResponse, facilityId);
    tfmToAdd = await addLatestAmendmentCoverEndDate(tfmToAdd, latestCoverEndDateResponse, facilityId);

    let latestFacilityEndDateResponse;
    if (isTfmFacilityEndDateFeatureFlagEnabled()) {
      latestFacilityEndDateResponse = await api.getLatestCompletedAmendmentFacilityEndDate(facilityId);
      tfmToAdd = await addLatestAmendmentFacilityEndDate(tfmToAdd, latestFacilityEndDateResponse);
    }

    const payload = {
      tfm: tfmToAdd,
    };

    await api.updateFacilityAmendment(facilityId, amendmentId, payload, auditDetails);
    return tfmToAdd;
  } catch (error) {
    console.error('TFM-API - unable to add TFM object to amendment %o', error);
    return null;
  }
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
  const { facilityId, amendmentIdOrStatus, type } = req.params;
  let amendment;
  switch (amendmentIdOrStatus) {
    case CONSTANTS.AMENDMENTS.AMENDMENT_QUERY_STATUSES.IN_PROGRESS:
      amendment = (await api.getAmendmentInProgress(facilityId)).data;
      break;
    case CONSTANTS.AMENDMENTS.AMENDMENT_QUERY_STATUSES.COMPLETED:
      if (type === AMENDMENT_QUERIES.LATEST_COVER_END_DATE) {
        amendment = await api.getLatestCompletedAmendmentDate(facilityId);
      } else if (type === AMENDMENT_QUERIES.LATEST_VALUE) {
        amendment = await api.getLatestCompletedAmendmentValue(facilityId);
      } else if (type === AMENDMENT_QUERIES.LATEST_FACILITY_END_DATE) {
        amendment = await api.getLatestCompletedAmendmentFacilityEndDate(facilityId);
      } else {
        amendment = await api.getCompletedAmendment(facilityId);
      }
      break;
    default:
      if (ObjectId.isValid(amendmentIdOrStatus)) {
        amendment = await api.getAmendmentById(facilityId, amendmentIdOrStatus);
      } else if (!amendmentIdOrStatus && !type) {
        amendment = await api.getAmendmentByFacilityId(facilityId);
      }
  }
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendment by facilityId' });
};

const getAmendmentsByDealId = async (req, res) => {
  const { dealId, status, type } = req.params;
  let amendment;
  switch (status) {
    case CONSTANTS.AMENDMENTS.AMENDMENT_QUERY_STATUSES.IN_PROGRESS:
      amendment = await api.getAmendmentInProgressByDealId(dealId);
      break;
    case CONSTANTS.AMENDMENTS.AMENDMENT_QUERY_STATUSES.COMPLETED:
      if (type === AMENDMENT_QUERIES.LATEST) {
        amendment = await api.getLatestCompletedAmendmentByDealId(dealId);
      } else {
        amendment = await api.getCompletedAmendmentByDealId(dealId);
      }
      break;
    default:
      if (!status && !type) {
        amendment = await api.getAmendmentsByDealId(dealId);
      }
  }
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to get the amendments by deal Id' });
};

const getAllAmendments = async (req, res) => {
  const { status } = req.params;
  let amendment;
  if (status === CONSTANTS.AMENDMENTS.AMENDMENT_QUERY_STATUSES.IN_PROGRESS) {
    amendment = await api.getAllAmendmentsInProgress();
  }
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ data: 'Unable to fetch amendments' });
};

const createFacilityAmendment = async (req, res) => {
  const { facilityId } = req.body;
  const { amendmentId } = await api.createFacilityAmendment(facilityId, generateTfmAuditDetails(req.user._id));
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
      let amendment = await api.getAmendmentById(facilityId, amendmentId);
      if (payload.createTasks && payload.submittedByPim) {
        const { tfm } = await api.findOneFacility(facilityId);
        payload.tasks = createAmendmentTasks(payload.requireUkefApproval, tfm);
        delete payload.createTasks;
        delete payload.requireUkefApproval;
      }

      if (payload.leadUnderwriter) {
        // Tasks are not present in payload when leadUnderwriter is updated, so it is safe to add `tasks`.
        payload.tasks = await getTasksAssignedToUserByGroup(amendment.tasks, CONSTANTS.TEAMS.UNDERWRITERS.id, payload.leadUnderwriter._id);
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
      payload = calculateAcbsUkefExposure(payload);

      const auditDetails = generateTfmAuditDetails(req.user._id);

      // Update Amendment
      const createdAmendment = await api.updateFacilityAmendment(facilityId, amendmentId, payload, auditDetails);
      // sends email if conditions are met
      await sendAmendmentEmail(amendmentId, facilityId, auditDetails);
      // if facility successfully updated and completed, then adds tfm lastUpdated and tfm object in amendments
      if (createdAmendment && tfmLastUpdated) {
        await updateTFMDealLastUpdated(amendmentId, facilityId, auditDetails);
        await createAmendmentTFMObject(amendmentId, facilityId, auditDetails);
      }

      // Fetch facility object
      const facility = await api.findOneFacility(facilityId);
      const { ukefFacilityId } = facility.facilitySnapshot;
      // Fetch complete amendment object
      amendment = await api.getAmendmentById(facilityId, amendmentId);
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
        // TFM Facility update + ACBS Interaction
        if (canSendToAcbs(amendment)) {
          // Amend facility TFM properties
          await amendIssuedFacility(amendment, facility, tfmDeal, generateTfmAuditDetails(req.user._id));
          // Amendment email notification to PDC
          await internalAmendmentEmail(ukefFacilityId);
          // Amend facility ACBS records
          acbs.amendAcbsFacility(amendment, facility, deal);
        }
      }

      if (createdAmendment) {
        return res.status(200).send(createdAmendment);
      }
    }
  } catch (error) {
    console.error('Unable to update amendment %o', error);
    return res.status(400).send({ data: 'Unable to update amendment' });
  }

  return res.status(422).send({ data: 'Unable to update amendment' });
};

module.exports = {
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAmendmentsByDealId,
  getAllAmendments,
  sendAmendmentEmail,
  updateTFMDealLastUpdated,
  createAmendmentTFMObject,
};
