const moment = require('moment');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const tfmController = require('./tfm.controller');
const isIssued = require('../helpers/is-issued');
const CONSTANTS = require('../../constants');

const addToACBSLog = async ({
  deal = {}, facility = {}, bank = {}, acbsTaskLinks,
}) => {
  const collection = await db.getCollection('durable-functions-log');

  const acbsLog = await collection.insertOne({
    // eslint-disable-next-line no-underscore-dangle
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
   * 2. Add ACBS records to the TFM activites
   */
  await tfmController.updateAcbs(taskOutput);

  const facilitiesUpdates = facilities.map((facility) => {
    const { facilityId, ...acbsFacility } = facility;
    // Add `acbs` object to tfm-facilities
    return tfmController.updateFacilityAcbs(facilityId, acbsFacility);
  });
  await Promise.all(facilitiesUpdates);
};

const updateIssuedFacilityAcbs = ({ facilityId, issuedFacilityMaster }) =>
  tfmController.updateFacilityAcbs(facilityId, { issuedFacilityMaster });

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
     * If the above is false, please do not proceed
     */
    return false;
  }

  const acbsIssuedFacilitiesPromises = deal.facilities.filter((facility) => {
    // Only concerned with issued facilities on Portal that aren't issued on ACBS
    const facilityStageInAcbs = facility.tfm.acbs && facility.tfm.acbs.facilityStage;
    return !isIssued(facilityStageInAcbs) && !facility.tfm.acbs.issuedFacilityMaster && isIssued(facility.facilityStage);
  }).map((facility) => api.updateACBSfacility(facility, deal.dealType, deal.exporter.companyName));

  const acbsIssuedFacilities = await Promise.all(acbsIssuedFacilitiesPromises);

  const acbsIssueFacilityTasks = await Promise.all(
    acbsIssuedFacilities.map((acbsTaskLinks) => addToACBSLog({ acbsTaskLinks })),
  );
  return acbsIssueFacilityTasks;
};

module.exports = {
  addToACBSLog,
  clearACBSLog,
  createACBS,
  checkAzureAcbsFunction,
  issueAcbsFacilities,
};
