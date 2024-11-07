/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Guarantee Record amendment SOF
 * ***************************************
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
 * This function is responsible for amending Facility Guarantee Record.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

/**
 * Durable Orchestration Function (DOF) for amending a facility guarantee record in the ACBS system.
 *
 * This function is triggered by an HTTP trigger function and performs the following operations:
 * 1. Validates the input payload.
 * 2. Maps the amendments to the facility guarantee record.
 * 3. Updates the facility guarantee record in the ACBS system.
 *
 * @param {Object} context - The context object provided by Durable Functions.
 * @param {Object} context.df - The Durable Functions context.
 * @param {Object} context.df.input - The input payload containing the facility ID and amendments.
 * @param {string} context.df.input.facilityId - The ID of the facility to be amended.
 * @param {Object} context.df.input.amendments - The amendments to be applied.
 * @param {Object} context.df.input.amendments.amendment - The specific amendment details.
 * @returns {Object} - The result of the facility guarantee record amendment.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
df.app.orchestration('acbs-amend-facility-guarantee-record', function* amendFacilityGuarantee(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Guarantee Record amendment SOF - Invalid payload provided');
    }

    const { facilityId, amendments } = payload;
    const { amendment } = amendments;

    // 4.1. Facility Guarantee Record (FGR) amendment mapping
    const acbsFacilityGuaranteeInput = mappings.facility.facilityGuaranteeAmend(amendment);

    // 4.2. Facility Guarantee Record update
    const facilityGuaranteeRecordAmendment = yield context.df.callActivityWithRetry('update-facility-guarantee', retryOptions, {
      facilityId,
      acbsFacilityGuaranteeInput,
    });

    return facilityGuaranteeRecordAmendment;
  } catch (error) {
    console.error('Error amending facility guarantee record %o', error);
    throw new Error(`Error amending facility guarantee record ${error}`);
  }
});
