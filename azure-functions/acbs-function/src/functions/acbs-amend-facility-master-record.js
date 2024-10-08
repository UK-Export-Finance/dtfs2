/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Master Record amendment SOF
 * ************************************
 * This is a sub-orchestrated function invoked from it's master orchestrator.
 * `acbs-amend-facility` is the master orchestrator for this function.
 *
 * Sub-Orchestration Function (SOF)
 * --------------------------------
 * This function cannot be invoked directly and must be invoked by a DOF.
 *
 * Prerequisites
 * -------------
 * 0. 'npm install durable-functions'
 * 1. Durable HTTP trigger function (acbs-http)
 * 2. DOF (acbs-amend-facility)
 * 3. DAF (update-facility-master, get-facility-master)
 *
 * ACBS
 * ----
 * This function is responsible for amending FMR.
 * FMR is a parent record, created for every facility.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

/**
 * Durable Orchestration Function (DOF) for amending a facility master record in the ACBS system.
 *
 * This function is triggered by an HTTP trigger function and performs the following operations:
 * 1. Validates the input payload.
 * 2. Maps the amendments to the facility master record.
 * 3. Updates the facility master record in the ACBS system.
 * 4. Handles specific amendments such as amount and cover end date.
 *
 * @param {Object} context - The context object provided by Durable Functions.
 * @param {Object} context.df - The Durable Functions context.
 * @param {Object} context.df.input - The input payload containing the deal, facility ID, facility master record (FMR), etag, and amendments.
 * @param {Object} context.df.input.deal - The deal associated with the facility.
 * @param {string} context.df.input.facilityId - The ID of the facility to be amended.
 * @param {Object} context.df.input.fmr - The facility master record to be amended.
 * @param {string} context.df.input.etag - The etag of the facility master record.
 * @param {Object} context.df.input.amendments - The amendments to be applied.
 * @param {Object} context.df.input.amendments.amendment - The specific amendment details.
 * @returns {Object} - The result of the facility master record amendment.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
df.app.orchestration('acbs-amend-facility-master-record', function* amendFacilityMaster(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Master Record amendment SOF - Invalid payload provided');
    }

    const { deal, facilityId, fmr, etag, amendments } = payload;
    const { amendment } = amendments;
    let facilityMasterRecordAmendment;

    // 2.1. Facility Master Record (FMR) mapping
    const acbsFacilityMasterInput = mappings.facility.facilityMasterAmend(fmr, amendments, deal);

    // 2.2.1 - UKEF Exposure
    if (amendment.amount) {
      const amount = yield context.df.callActivityWithRetry('update-facility-master', retryOptions, {
        facilityId,
        acbsFacilityMasterInput,
        updateType: 'amendAmount',
        etag,
      });

      facilityMasterRecordAmendment = {
        amount,
      };
    }

    // 2.2.2 - Cover end date
    if (amendment.coverEndDate) {
      // 2.2.3. DAF : get-facility-master: Retrieve ACBS `Facility Master Record` with new eTag
      const updatedFmr = yield context.df.callActivityWithRetry('get-facility-master', retryOptions, facilityId);

      if (updatedFmr.etag) {
        const coverEndDate = yield context.df.callActivityWithRetry('update-facility-master', retryOptions, {
          facilityId,
          acbsFacilityMasterInput,
          updateType: 'amendExpiryDate',
          etag: updatedFmr.etag,
        });

        facilityMasterRecordAmendment = {
          ...facilityMasterRecordAmendment,
          updatedFmr,
          coverEndDate,
        };
      }
    }

    return facilityMasterRecordAmendment;
  } catch (error) {
    console.error('Error amending facility master record %o', error);
    throw new Error(`Error amending facility master record ${error}`);
  }
});
