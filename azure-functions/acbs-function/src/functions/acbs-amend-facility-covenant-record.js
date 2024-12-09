/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Covenant Record amendment SOF
 * **************************************
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
 * 3. DAF (amend-facility-loan)
 *
 * ACBS
 * ----
 * This function is responsible for amending Facility Covenant Record.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

/**
 * Durable Orchestration Function (DOF) for amending a facility covenant record in the ACBS system.
 *
 * This function is triggered by an HTTP trigger function and performs the following operations:
 * 1. Validates the input payload.
 * 2. Maps the amendments to the facility covenant record.
 * 3. Updates the facility covenant record in the ACBS system.
 *
 * @param {Object} context - The context object provided by Durable Functions.
 * @param {Object} context.df - The Durable Functions context.
 * @param {Object} context.df.input - The input payload containing the facility ID and amendments.
 * @param {string} context.df.input.facilityIdentifier - The ID of the facility to be amended.
 * @param {Object} context.df.input.amendments - The amendments to be applied.
 * @param {Object} context.df.input.amendments.amendment - The specific amendment details.
 * @returns {Object} - The result of the facility covenant record amendment.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
df.app.orchestration('acbs-amend-facility-covenant-record', function* amendFacilityCovenant(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Covenant Record amendment SOF - Invalid payload provided');
    }

    const { facilityIdentifier, amendments } = payload;
    const { amendment } = amendments;

    // 3.1. Facility Covenant Record (FCR) amend mapping
    const acbsFacilityCovenantInput = mappings.facility.facilityCovenantAmend(amendment);

    // 3.2. Facility Covenant Record update
    const facilityCovenantRecordAmendment = yield context.df.callActivityWithRetry('update-facility-covenant', retryOptions, {
      facilityIdentifier,
      acbsFacilityCovenantInput,
    });

    return facilityCovenantRecordAmendment;
  } catch (error) {
    console.error('Error amending facility covenant record %o', error);
    throw new Error(`Error amending facility covenant record ${error}`);
  }
});
