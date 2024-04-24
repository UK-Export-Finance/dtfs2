const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { DURABLE_FUNCTIONS_LOG } = require('@ukef/dtfs2-common');
const {
  generateSystemAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-database-record');
const api = require('../api');
const db = require('../../drivers/db-client');
const tfmController = require('./tfm.controller');
const CONSTANTS = require('../../constants');
const { formatCoverEndDate } = require('../helpers/amendment.helpers');
const { getIsoStringWithOffset } = require('../../utils/date');
const isIssuedInACBS = require('../helpers/is-issued-acbs');

const addToACBSLog = async ({ deal = {}, facility = {}, bank = {}, acbsTaskLinks }) => {
  const collection = await db.getCollection('durable-functions-log');

  if (ObjectId.isValid(deal._id)) {
    return collection.insertOne({
      type: DURABLE_FUNCTIONS_LOG.TYPE.ACBS,
      dealId: deal._id,
      deal,
      facility,
      bank,
      status: 'Running',
      instanceId: acbsTaskLinks.id,
      acbsTaskLinks,
      submittedDate: getIsoStringWithOffset(new Date()),
      auditRecord: generateSystemAuditDatabaseRecord(),
    });
  }

  return false;
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

  const facilitiesUpdates = facilities
    .filter((facility) => facility.facilityId)
    .map((facility) => {
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
    const runningTasks = await collection
      .find({
        type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS },
        status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.RUNNING },
      })
      .toArray();
    const tasks = await runningTasks.map(({ acbsTaskLinks = {} }) =>
      api.getFunctionsAPI(acbsTaskLinks.statusQueryGetUri),
    );
    const taskList = await Promise.all(tasks);

    taskList.forEach(async (task) => {
      if (task.runtimeStatus) {
        // Update
        if (task.runtimeStatus !== 'Running') {
          await collection.findOneAndUpdate(
            { instanceId: { $eq: task.instanceId } },
            $.flatten({
              status: task.runtimeStatus,
              acbsTaskResult: task,
              auditRecord: generateSystemAuditDatabaseRecord(),
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
    console.error('Error processing durable functions log %o', error);
  }
};

/**
 * Issues facilities in the ACBS, if prerequisites are satisfied.
 * 1. Ensure facility has been issued in Portal.
 * 2. Facility has been created in ACBS.
 * 3. Facility in ACBS is `06` stage.
 * @param {object} deal - The deal object containing information about the deal, including facilities and ACBS details.
 * @returns {Promise<Object>} - A promise that resolves with the results of adding the facilities to ACBS log.
 */
const issueAcbsFacilities = async (deal) => {
  if (!deal?.tfm?.acbs) {
    /**
     * A facility can only be issued (if unissued),
     * the deal has been submitted to ACBS and acknowledged by the TFM.
     * If the above is false, please do not proceed.
     */
    console.error('Unable to issue facility in ACBS for deal %s', deal._id);
    return false;
  }
  
  /**
   * ACBS verification: Facility stage verification ensures facility which are
   * under commitment stage (06) are only eligible for issuance
   */
  console.error('Issuing facilities in ACBS for deal %s', deal._id);
  const acbsIssuedFacilitiesPromises = deal.facilities
    .filter((facility) => facility?.hasBeenIssued && !isIssuedInACBS(facility?.tfm?.acbs.facilityStage))
    .map((facility) =>
      api.updateACBSfacility(facility, {
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

  return Promise.all(acbsIssuedFacilities.map((acbsTaskLinks) => addToACBSLog({ acbsTaskLinks })));
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
  checkAzureAcbsFunction,
  issueAcbsFacilities,
  amendAcbsFacility,
};
