/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Guarantee Record amendment SOF
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
 * This function is responsible for amending Facility Guarantee Record.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

df.app.orchestration('acbs-amend-facility-guarantee-record', function* amendFacilityGuarantee(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Guarantee Record amendment SOF - Invalid payload provided');
    }

    const { facilityId, amendments } = payload;
    const { amendment } = amendments;

    // 2.1. Facility Guarantee Amend mapping
    const facilityGuaranteeAmendMapped = mappings.facility.facilityGuaranteeAmend(amendment);

    // 2.2. Facility Guarantee Record update
    const facilityGuaranteeRecord = yield context.df.callActivityWithRetry('update-facility-guarantee', retryOptions, {
      facilityId,
      acbsFacilityGuaranteeInput: facilityGuaranteeAmendMapped,
    });
    return facilityGuaranteeRecord;
  } catch (error) {
    console.error('Error amending facility guarantee record %o', error);
    throw new Error(`Error amending facility guarantee record ${error}`);
  }
});
