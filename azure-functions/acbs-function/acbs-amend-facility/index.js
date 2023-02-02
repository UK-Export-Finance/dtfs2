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
 * Check
 * ------
 * 1. `07`facility only
 *
 * Prerequisites
 * -------------
 * 0. 'npm install durable-functions'
 * 1. Durable HTTP starter function (acbs-http)
 * 2. Durable activity function (activity-get-facility-master, activity-update-facility-master)
 */

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');

const acceptableFacilityStage = ['07'];

module.exports = df.orchestrator(function* amendACBSFacility(context) {
  try {
    const { amendment } = context.df.getInput();
    if (amendment) {
      // UKEF Facility ID exists in the payload
      const hasFacilityId = Boolean(amendment.facilityId);
      // At least one of the amendment exists in the payload
      const hasAmendment = Boolean(amendment.amount) || Boolean(amendment.coverEndDate);
      // Facility object existence check
      const hasFacility = amendment.facility;
      // Deal properties existence check
      const hasDeal = amendment.deal && amendment.deal.dealSnapshot;

      // Payload verification
      if (hasFacilityId && hasAmendment && hasFacility && hasDeal) {
        const { facility, deal, facilityId } = amendment;
        // 1. DAF : activity-get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
        const { acbsFacility: fmr, etag } = yield context.df.callActivityWithRetry('activity-get-facility-master', retryOptions, { facilityId });

        /**
         * Check 1 - Facility stage `07` only
         * Ensure facility is `Issued` before processing amendment payload
         */
        const { facilityStageCode } = fmr;

        if (!acceptableFacilityStage.includes(facilityStageCode)) {
          // Error upon unacceptable facility stage
          console.error(`Facility ${facilityId} stage is ${facilityStageCode}, amendment will not be processed`);

          return {
            facilityId,
            facilityLoanRecord: {
              error: `Facility ${facilityId} stage is ${facilityStageCode}, amendment will not be processed`,
            },
            facilityMasterRecord: {
              error: `Facility ${facilityId} stage is ${facilityStageCode}, amendment will not be processed`,
            },
          };
        }

        if (!!fmr && !!etag && !!facility.facilitySnapshot) {
          const amendments = {
            amendment,
          };

          /**
           * *************************** AMENDMENT SOFs ***************************
           */

          // 1. SOF: Facility Loan Record (FLR)
          const facilityLoanRecord = context.df.callSubOrchestrator('acbs-amend-facility-loan-record', {
            facilityId,
            facility,
            amendments,
            fmr,
          });

          yield context.df.Task.all([facilityLoanRecord]);

          // 2. SOF: Facility Master Record (FMR)
          const facilityMasterRecord = context.df.callSubOrchestrator('acbs-amend-facility-master-record', {
            deal,
            facilityId,
            fmr,
            etag,
            amendments,
          });

          yield context.df.Task.all([facilityMasterRecord]);

          return {
            facilityId,
            facilityLoanRecord: facilityLoanRecord.result,
            facilityMasterRecord: facilityMasterRecord.result,
          };
        }
        throw new Error('ACBS facility amendment error : Unable to retrieve FMR.');
      }
    }

    throw new Error('Void argument set');
  } catch (e) {
    console.error('ACBS facility amendment error: ', { e });
    return e;
  }
});
