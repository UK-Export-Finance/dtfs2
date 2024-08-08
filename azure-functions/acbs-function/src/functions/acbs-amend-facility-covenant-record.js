/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Covenant Record amendment SOF
 * **********************************
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

df.app.orchestration('acbs-amend-facility-covenant-record', function* amendFacilityCovenant(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Covenant Record amendment SOF - Invalid payload provided');
    }

    const { facilityId, amendments } = payload;
    const { amendment } = amendments;

    // 2.1. Facility Covenant Amend mapping
    const facilityCovenantAmendMapped = mappings.facility.facilityCovenantAmend(amendment);

    // 2.2. Facility Covenant Record update
    const facilityCovenantRecord = yield context.df.callActivityWithRetry('update-facility-covenant', retryOptions, {
      facilityId,
      acbsFacilityCovenantInput: facilityCovenantAmendMapped,
    });
    return facilityCovenantRecord;
  } catch (error) {
    console.error('Error amending facility covenant record %o', error);
    throw new Error(`Error amending facility covenant record ${error}`);
  }
});
