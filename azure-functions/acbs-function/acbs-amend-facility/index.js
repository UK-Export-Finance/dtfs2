/**
 * Facility Amendment DOF
 * ***********************
 * This DOF invokes following activity functions to satisfy mandatory amendments ACs
 * 1. activity-get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
 * 2. activity-update-facility-master: Update ACBS `Facility Master Record`
 * 3. activity-amend-facility-loan: Update ACBS `Facility Loan Record`
 *
 * Durable Orchestration Function (DOF)
 * ------------------------------------
 * This function is not intended to be invoked directly.
 * This function is trigger by an HTTP starter function (acbs-http).
 *
 * Prerequisites
 * -------------
 * 1. Durable activity function (activity-get-facility-master)
 * 2. Durable HTTP starter function (acbs-http)
 * 3. 'npm install durable-functions'
 */

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');
const mappings = require('../mappings');
const CONSTANTS = require('../constants');
const helpers = require('../mappings/facility/helpers');

module.exports = df.orchestrator(function* amendACBSFacility(context) {
  try {
  const { amendment } = context.df.getInput();

  // UKEF Facility ID exists in the payload
  const hasFacilityId = Boolean(amendment.facilityId);
  // At least one of the amendment exists in the payload
  const hasAmendment = Boolean(amendment.amount) || Boolean(amendment.coverEndDate);
  // Deal properties existence check
  const hasDeal = amendment.deal && Object.prototype.hasOwnProperty.call(amendment.deal, 'dealSnapshot');

  // Payload verification
  if (hasFacilityId && hasAmendment && hasDeal) {
    const { deal, facilityId } = amendment;
    //1. DAF : activity-get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
    const { acbsFacility: fmr, etag } = yield context.df.callActivityWithRetry(
      'activity-get-facility-master',
      retryOptions,
      { facilityId },
    );

    if (!!fmr && !!etag) {
      const amendments = {
        amendment,
      };
      //2.1. FMR amendment mapping
      const fmrAmend = mappings.facility.facilityMasterAmend(fmr, amendments, deal);

      //2.2. FMR update
      const fmrAmended = yield context.df.callActivityWithRetry(
        'activity-update-facility-master',
        retryOptions,
        {
          facilityId,
          acbsFacilityMasterInput: fmrAmend,
          updateType: 'amendAmount',
          etag,
        }
      );

      return {
        fmrAmended
      };
    } else {
      console.error('ACBS facility amendment error : Unable to retrieve FMR.');
    }

  } else {
    console.error('ACBS facility amendment error : Empty or invalid argument(s) provided');
  }
} catch (e) {
  console.error(`ACBS facility amendment error : ${e}`);
}

return {};
});
