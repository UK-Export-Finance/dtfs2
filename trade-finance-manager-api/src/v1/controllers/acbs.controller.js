const moment = require('moment');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const tfmController = require('./tfm.controller');
const CONSTANTS = require('../../constants');

const addToACBSLog = async ({
  deal = {}, facility = {}, bank = {}, acbsTaskLinks,
}) => {
  const collection = await db.getCollection('durable-functions-log');

  const acbsLog = await collection.insertOne({
    type: 'ACBS',
    dealId: deal._id,
    deal,
    facility,
    bank,
    status: 'Running',
    instanceId: acbsTaskLinks.id,
    acbsTaskLinks,
    submittedDate: moment().format(),
  });

  return acbsLog;
};

const clearACBSLog = async () => {
  const collection = await db.getCollection('durable-functions-log');
  const removed = await collection.remove({});

  return removed;
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
  return addToACBSLog({ deal, bank, acbsTaskLinks });
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

const updateIssuedFacilityAcbs = ({ facilityId, issuedFacilityMaster }) =>
  tfmController.updateFacilityAcbs(facilityId, {
    facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
    issuedFacilityMaster,
  });

const checkAzureAcbsFunction = async () => {
  try {
  // Fetch outstanding functions
    const collection = await db.getCollection('durable-functions-log');
    const runningTasks = await collection.find({
      type: 'ACBS',
      status: 'Running',
    }).toArray();
    const tasks = await runningTasks.map(async ({ acbsTaskLinks = {} }) =>
      api.getFunctionsAPI(CONSTANTS.DURABLE_FUNCTIONS.TYPE.ACBS, acbsTaskLinks.statusQueryGetUri));
    const taskList = await Promise.all(tasks);

    taskList.forEach(async (task) => {
      if (task.runtimeStatus) {
      // Update
        if (task.runtimeStatus !== 'Running') {
          await collection.findOneAndUpdate(
            { instanceId: task.instanceId },
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

            default:
              await updateDealAcbs(task.output);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error processing durable functions log', { error });
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

  const acbsIssueFacilityTasks = await Promise.all(
    acbsIssuedFacilities.map((acbsTaskLinks) => addToACBSLog({ acbsTaskLinks })),
  );
  return acbsIssueFacilityTasks;
};

const amendAcbsFacility = async (ukefFacilityId, amendments) => {
  api.amendACBSfacility(ukefFacilityId, amendments)
    .then((r) => console.info('RESPONSE===', r))
    .catch((e) => {
      console.error('Unable to amend facility: ', { e });
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
