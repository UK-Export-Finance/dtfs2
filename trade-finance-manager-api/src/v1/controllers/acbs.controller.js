const moment = require('moment');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const tfmController = require('./tfm.controller');
const CONSTANTS = require('../../constants');
const { formatCoverEndDate } = require('../helpers/amendment.helpers');

const addToACBSLog = async ({
  deal = {}, facility = {}, bank = {}, acbsTaskLinks,
}) => {
  const collection = await db.getCollection('durable-functions-log');

  if (ObjectId.isValid(deal._id)) {
    return collection.insertOne({
      type: 'ACBS',
      dealId: deal._id,
      deal,
      facility,
      bank,
      status: CONSTANTS.DURABLE_FUNCTIONS.STATUS.RUNNING,
      instanceId: acbsTaskLinks.id,
      acbsTaskLinks,
      submittedDate: moment().format(),
    });
  }

  return false;
};

const clearACBSLog = async () => {
  const collection = await db.getCollection('durable-functions-log');
  return collection.remove({});
};

const createACBS = async (deal) => {
  // Reference partyUrn in function
  const { dealSnapshot } = deal;
  const { bank } = dealSnapshot;

  if (!bank) {
    return false;
  }

  const { id, name, partyUrn } = bank;

  const acbsTaskLinks = await api.createACBS(deal, { id, name, partyUrn });

  if (acbsTaskLinks) {
    return addToACBSLog({ deal, bank, acbsTaskLinks });
  }

  return null;
};

const updateDealAcbs = async (taskOutput) => {
  const { facilities } = taskOutput;
  /**
   * 1. Add `acbs` object to tfm-deal
   * 2. Add ACBS records to the TFM activities
   */
  await tfmController.updateAcbs(taskOutput);

  const facilitiesUpdates = facilities.filter((facility) => facility.facilityId).map((facility) => {
    const { facilityId, ...acbsFacility } = facility;
    // Add `acbs` object to tfm-facilities
    return tfmController.updateFacilityAcbs(facilityId, acbsFacility);
  });
  await Promise.all(facilitiesUpdates);
};

/**
 * Updated `tfm.acbs` property of a facility upon successful
 * facility issuance.
 * @param {String} ID UKEF Facility mongo ID
 * @param {Object} FMR Facility master record
 * @param {Object} FLR Facility loan record
 * @param {Object} FFR Facility fixed fee record
 * @returns {Object} ACBS returned response
 */
const updateIssuedFacilityAcbs = ({ facilityId, issuedFacilityMaster, facilityLoan, facilityFee }) =>
  tfmController.updateFacilityAcbs(facilityId, {
    facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
    issuedFacilityMaster,
    facilityLoan,
    facilityFee,
  });

const updateAmendedFacilityAcbs = (taskResult) => {
  if (taskResult.instanceId && taskResult.output) {
    const { instanceId } = taskResult;
    const { facilityMasterRecord, facilityLoanRecord } = taskResult.output;
    const { _id } = taskResult.input.amendment.facility;
    const acbsUpdate = {
      [instanceId]: {
        facilityMasterRecord,
        facilityLoanRecord,
      },
    };

    // Update tfm-facilities `acbs` object with ACBS amendments response
    tfmController.updateFacilityAcbs(_id, acbsUpdate);
  }
};

const checkAzureAcbsFunction = async () => {
  try {
  // Fetch outstanding functions
    const collection = await db.getCollection('durable-functions-log');
    const runningTasks = await collection.find({
      type: { $eq: 'ACBS' },
      status: { $eq: CONSTANTS.DURABLE_FUNCTIONS.STATUS.RUNNING },
    }).toArray();
    const tasks = await runningTasks.map(({ acbsTaskLinks = {} }) =>
      api.getFunctionsAPI(CONSTANTS.DURABLE_FUNCTIONS.TYPE.ACBS, acbsTaskLinks.statusQueryGetUri));
    const taskList = await Promise.all(tasks);

    taskList.forEach(async (task) => {
      if (task.runtimeStatus) {
      // Update
        if (task.runtimeStatus !== CONSTANTS.DURABLE_FUNCTIONS.STATUS.RUNNING) {
          await collection.findOneAndUpdate(
            { instanceId: { $eq: task.instanceId } },
            $.flatten({
              status: task.runtimeStatus,
              acbsTaskResult: task,
            }),
          );
        }
        // ADD `acbs` object to tfm-deals and tfm-facilities
        if (task.runtimeStatus === 'Completed') {
          switch (task.name) {
            case 'acbs-issue-facility':
              await updateIssuedFacilityAcbs(task.output);
              break;

            case 'acbs-amend-facility':
              await updateAmendedFacilityAcbs(task);
              break;

            default:
              await updateDealAcbs(task.output);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error processing durable functions log %s', error);
  }
};

const issueAcbsFacilities = async (deal) => {
  if (!deal.tfm || !deal.tfm.acbs) {
    /**
     * A facility can only be issued (if unissued),
     * the deal has been submitted to ACBS and acknowledged by the TFM.
     * If the above is false, please do not proceed.
     */
    return false;
  }
  /**
   * ACBS verification has been removed due to an ongoing bug of not receiving
   * the `acbs` object imperative data thus preventing maker from issuing the facility.
   * TO-DO:
   * !isIssued(facilityStageInAcbs) && !facility.tfm.acbs.issuedFacilityMaster
   * const facilityStageInAcbs = facility.tfm.acbs && facility.tfm.acbs.facilityStage;
   */

  const acbsIssuedFacilitiesPromises = deal.facilities.filter((facility) => facility.hasBeenIssued).map((facility) => api.updateACBSfacility(facility, {
    dealSnapshot: {
      dealType: deal.dealType,
      submissionType: deal.submissionType,
      submissionDate: deal.submissionDate,
    },
    exporter: {
      ...deal.exporter,
    },
  }));
  const acbsIssuedFacilities = await Promise.all(acbsIssuedFacilitiesPromises);

  return Promise.all(
    acbsIssuedFacilities.map((acbsTaskLinks) => addToACBSLog({ acbsTaskLinks })),
  );
};
/**
 * Amend facility controller function responsible for invoking
 * respective API and writes ACBS task links to DB.
 * @param {Object} amendments Facility amendments object
 * @param {Object} facility Complete TFM facility object
 * @param {Object} deal Bespoke deal object
 */
const amendAcbsFacility = (amendments, facility, deal) => {
  let payload = amendments;

  // TO-DO : EPOCH Convergence
  if (amendments.coverEndDate) {
    payload = formatCoverEndDate(amendments);
  }

  api.amendACBSfacility(payload, facility, deal).then((acbsTaskLinks) => {
    if (acbsTaskLinks?.id) {
      return addToACBSLog({ acbsTaskLinks });
    }

    return null;
  })
    .catch((e) => {
      console.error('Unable to amend facility: %O', e);
      return null;
    });
};

module.exports = {
  addToACBSLog,
  clearACBSLog,
  createACBS,
  checkAzureAcbsFunction,
  issueAcbsFacilities,
  amendAcbsFacility,
};
