const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { MONGO_DB_COLLECTIONS, DURABLE_FUNCTIONS_LOG } = require('@ukef/dtfs2-common');
const { generateSystemAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const {
  PAYLOAD_VERIFICATION: { ACBS },
} = require('@ukef/dtfs2-common');
const api = require('../api');
const { mongoDbClient: db } = require('../../drivers/db-client');
const tfmController = require('./tfm.controller');
const CONSTANTS = require('../../constants');
const { formatCoverEndDate } = require('../helpers/amendment.helpers');
const { getIsoStringWithOffset } = require('../../utils/date');
const isUnissuedInACBS = require('../helpers/is-facility-unissued-acbs');
const { findOneTfmDeal } = require('./deal.controller');

/**
 * Adds a log entry to the ACBS log collection in the database.
 * @param {object} payload - The payload object.
 * @param {object} payload.deal - The deal object.
 * @param {object} payload.facility - The facility object.
 * @param {object} payload.bank - The bank object.
 * @param {object} payload.acbsTaskLinks - The ACBS task links object.
 * @returns {Promise<Object|boolean>} - A promise that resolves to the inserted log entry if successful, or false otherwise.
 */
const addToACBSLog = async (payload) => {
  if (!payload?.deal || !payload?.acbsTaskLinks) {
    return false;
  }

  const auditDetails = generateSystemAuditDetails();

  const { deal, facility, bank, acbsTaskLinks } = payload;
  const canAddToLog = ObjectId.isValid(deal?._id) && Boolean(deal?._id) && Boolean(acbsTaskLinks?.id);

  if (canAddToLog) {
    const logEntry = {
      type: DURABLE_FUNCTIONS_LOG.TYPE.ACBS,
      dealId: deal?._id,
      deal,
      facility: facility || {},
      bank: bank || {},
      status: DURABLE_FUNCTIONS_LOG.STATUS.RUNNING,
      instanceId: acbsTaskLinks.id,
      acbsTaskLinks,
      submittedDate: getIsoStringWithOffset(new Date()),
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    return collection.insertOne(logEntry);
  }

  return false;
};

/**
 * Creates an ACBS task and adds it to the ACBS log.
 * @param {string} dealId - TFM Mongo deal object ID
 * @returns {Promise<boolean>} - True if the ACBS task is successfully created and added to the log, false otherwise.
 */
const createACBS = async (dealId) => {
  if (!ObjectId.isValid(dealId)) {
    console.error('Invalid deal Id %s', dealId);
    return false;
  }

  const deal = await findOneTfmDeal(dealId);

  // Check if the dealSnapshot has a bank property
  if (!deal?.dealSnapshot?.bank) {
    return false;
  }

  const { bank } = deal.dealSnapshot;
  const { id, name, partyUrn } = bank;

  // ACBS deal payload objects
  const acbsBank = {
    id,
    name,
    partyUrn,
  };

  /**
   * 1. Property `auditRecord` does not need to be send to ACBS DOF
   * 2. Ensure `acbsDeal` object has required properties before expensive
   * API execution
   */
  const { auditRecord, ...acbsDeal } = deal;

  // Imperative properties check
  if (!isVerifiedPayload({ payload: acbsBank, template: ACBS.BANK })) {
    console.error('Invalid ACBS bank payload, terminating API call for deal %s', acbsDeal._id);
    return false;
  }

  if (!isVerifiedPayload({ payload: acbsDeal, template: ACBS.DEAL })) {
    console.error('Invalid ACBS deal payload, terminating API call for deal %s', acbsDeal._id);
    return false;
  }

  const acbsTaskLinks = await api.createACBS(acbsDeal, acbsBank);

  // Check if the ACBS task is successfully created
  if (acbsTaskLinks) {
    // Add the ACBS task to the log using the addToACBSLog function
    return await addToACBSLog({ deal, bank, acbsTaskLinks });
  }

  console.error('Unable to add ACBS call to the log for deal %s', acbsDeal._id);
  return false;
};

/**
 * Updates the ACBS information for a deal and its facilities.
 *
 * This function performs the following steps:
 * 1. Adds an `acbs` object to the TFM deal.
 * 2. Adds ACBS records to the TFM activities.
 * 3. Adds an `acbs` object to each TFM facility.
 *
 * @param {object} taskOutput - The task output containing deal and facilities information.
 * @param {Array} taskOutput.facilities - The list of facilities associated with the deal.
 * @param {string} taskOutput.facilities[].facilityId - The unique identifier for the facility.
 * @param {object} taskOutput.facilities[].acbsFacility - The ACBS information for the facility.
 * @returns {Promise<void>} A promise that resolves when the ACBS information has been updated.
 */
const updateDealAcbs = async (taskOutput) => {
  const { facilities } = taskOutput;

  if (!facilities) {
    console.error('No facilities found in output %o', taskOutput);
    await Promise.reject();
  }

  /**
   * 1. Add `acbs` object to tfm-deal
   * 2. Add ACBS records to the TFM activities
   */
  await tfmController.updateAcbs(taskOutput);

  const facilitiesUpdates = facilities
    .filter((facility) => facility.facilityIdentifier)
    .map((facility) => {
      const { facilityIdentifier, ...acbsFacility } = facility;
      // Add `acbs` object to tfm-facilities
      return tfmController.updateFacilityAcbs(facilityIdentifier, acbsFacility);
    });

  await Promise.all(facilitiesUpdates);
};

/**
 * Updated `tfm.acbs` property of a facility upon successful
 * facility issuance.
 * @param {string} ID UKEF Facility mongo ID
 * @param {object} FMR Facility master record
 * @param {object} FLR Facility loan record
 * @param {object} FFR Facility fixed fee record
 * @returns {object} ACBS returned response
 */
const updateIssuedFacilityAcbs = async ({ facilityIdentifier, issuedFacilityMaster, facilityLoan, facilityFee }) =>
  await tfmController.updateFacilityAcbs(facilityIdentifier, {
    facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
    issuedFacilityMaster,
    facilityLoan,
    facilityFee,
  });

/**
 * Updates the ACBS amendments for a facility in the TFM system.
 *
 * @param {object} taskResult - The result of the task containing the necessary data.
 * @param {string} taskResult.instanceId - The instance ID of the task.
 * @param {object} taskResult.output - The output data of the task.
 * @param {object} taskResult.output.facilityMasterRecord - The master record of the facility.
 * @param {object} taskResult.output.facilityLoanRecord - The loan record of the facility.
 * @param {object} taskResult.input - The input data of the task.
 * @param {object} taskResult.input.amendment - The amendment data.
 * @param {object} taskResult.input.amendment.facility - The facility data.
 * @param {string} taskResult.input.amendment.facility._id - The ID of the facility.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
const updateAmendedFacilityAcbs = async (taskResult) => {
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
    await tfmController.updateFacilityAcbs(_id, acbsUpdate);
  }
};

const checkAzureAcbsFunction = async () => {
  try {
    // Fetch outstanding functions
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    const runningTasks = await collection
      .find({
        type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS },
        status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.RUNNING },
      })
      .toArray();
    const tasks = await runningTasks.map(({ acbsTaskLinks = {} }) => api.getFunctionsAPI(acbsTaskLinks.statusQueryGetUri));
    const taskList = await Promise.all(tasks);

    const auditDetails = generateSystemAuditDetails();

    taskList.forEach(async (task) => {
      if (task.runtimeStatus) {
        // Update
        if (task.runtimeStatus !== DURABLE_FUNCTIONS_LOG.STATUS.RUNNING) {
          await collection.findOneAndUpdate(
            { instanceId: { $eq: task.instanceId } },
            $.flatten({
              status: task.runtimeStatus,
              acbsTaskResult: task,
              auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
            }),
          );
        }
        // ADD `acbs` object to tfm-deals and tfm-facilities
        if (task.runtimeStatus === DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED) {
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
    console.error('Error processing durable functions log %o', error);
  }
};

/**
 * Issues facilities in the ACBS, if prerequisites are satisfied.
 * 1. Ensure facility has been issued in Portal.
 * 2. Facility has been created in ACBS.
 * 3. Facility in ACBS is `06` stage.
 * @param {object} deal - The deal object containing information about the deal, including facilities and ACBS details.
 * @returns {Promise<object>} - A promise that resolves with the results of adding the facilities to ACBS log.
 */
const issueAcbsFacilities = async (deal) => {
  if (!deal?.tfm?.acbs) {
    /**
     * A facility can only be issued (if unissued),
     * the deal has been submitted to ACBS and acknowledged by the TFM.
     * If the above is false, please do not proceed.
     */
    console.error('Unable to issue deal %s facility to ACBS.', deal?._id);
    return false;
  }
  /**
   * Ensures following pre-conditions below invoking ACBS
   * 1. Facility has been issued on Portal
   * 2. Facility is not already issued in ACBS
   */
  console.info('✅ Submitting deal %s facility to ACBS.', deal._id);

  const acbsIssuedFacilitiesPromises = await deal.facilities
    .filter((facility) => facility?.hasBeenIssued && isUnissuedInACBS(facility?.tfm?.acbs.facilityStage))
    .map(
      async (facility) =>
        await api.issueACBSfacility(facility, {
          dealSnapshot: {
            dealType: deal.dealType,
            submissionType: deal.submissionType,
            submissionDate: deal.submissionDate,
          },
          exporter: {
            ...deal.exporter,
          },
        }),
    );

  const acbsIssuedFacilities = await Promise.all(acbsIssuedFacilitiesPromises);
  const promises = await Promise.all(
    acbsIssuedFacilities.filter((acbsTaskLinks) => acbsTaskLinks?.id).map(async (acbsTaskLinks) => await addToACBSLog({ deal, acbsTaskLinks })),
  );

  // Return `false` if promises is an empty array
  return promises.length ? promises : false;
};

/**
 * Amend facility controller function responsible for invoking
 * respective API and writes ACBS task links to DB.
 * @param {object} amendments Facility amendments object
 * @param {object} facility Complete TFM facility object
 * @param {object} deal Bespoke deal object
 */
const amendAcbsFacility = (amendments, facility, deal) => {
  let payload = amendments;

  // TO-DO : EPOCH Convergence
  if (amendments.coverEndDate) {
    payload = formatCoverEndDate(amendments);
  }

  api
    .amendACBSfacility(payload, facility, deal)
    .then((acbsTaskLinks) => {
      if (acbsTaskLinks?.id) {
        return addToACBSLog({ acbsTaskLinks });
      }

      return null;
    })
    .catch((error) => {
      console.error('Unable to amend facility %o', error);
      return null;
    });
};

module.exports = {
  addToACBSLog,
  createACBS,
  updateDealAcbs,
  checkAzureAcbsFunction,
  issueAcbsFacilities,
  amendAcbsFacility,
  updateIssuedFacilityAcbs,
  updateAmendedFacilityAcbs,
};
