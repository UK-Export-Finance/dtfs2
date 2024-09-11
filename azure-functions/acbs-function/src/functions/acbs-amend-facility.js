/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Amendment DOF
 * ***********************
 * This DOF invokes following activity functions to satisfy mandatory amendments ACs
 * 1. get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
 * 2. update-facility-master: Update ACBS `Facility Master Record`
 * 3. amend-facility-loan: Update ACBS `Facility Loan Record`
 *
 * Durable Orchestration Function (DOF)
 * ------------------------------------
 * This function is not intended to be invoked directly.
 * This function is trigger by an HTTP trigger function (acbs-http).
 *
 * Check
 * ------
 * 1. `07`facility only
 *
 * Prerequisites
 * -------------
 * 0. 'npm install durable-functions'
 * 1. Durable HTTP trigger function (acbs-http)
 * 2. Durable activity function (get-facility-master, update-facility-master)
 */

const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const { DEAL, FACILITY } = require('../../constants');

const acceptableFacilityStage = ['07'];

df.app.orchestration('acbs-amend-facility', function* amendFacility(context) {
  const payload = context.df.input;

  try {
    const { amendment } = payload;
    if (amendment) {
      const { facilityId, amount, coverEndDate } = amendment;

      // UKEF Facility ID exists in the payload
      const hasFacilityId = Boolean(facilityId);
      // At least one of the amendment exists in the payload
      const hasAmendment = Boolean(amount) || Boolean(coverEndDate);
      // Facility object existence check
      const hasFacility = amendment.facility;
      // Deal properties existence check
      const hasDeal = amendment.deal && amendment.deal.dealSnapshot;

      // Payload verification
      if (hasFacilityId && hasAmendment && hasFacility && hasDeal) {
        const { facility, deal } = amendment;
        const { facilitySnapshot } = facility;
        let facilityLoanRecord;

        if (facilityId.includes(DEAL.UKEF_ID.PENDING) || facilityId.includes(DEAL.UKEF_ID.TEST)) {
          throw new Error(`Invalid facility ID ${facilityId}`);
        }

        // 1. DAF : get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
        const { acbsFacility: fmr, etag } = yield context.df.callActivityWithRetry('get-facility-master', retryOptions, facilityId);

        /**
         * Check 1 - Facility stage `07` only
         * Ensure facility is `Issued` before processing amendment payload
         */
        const { facilityStageCode } = fmr;

        if (!acceptableFacilityStage.includes(facilityStageCode)) {
          // Error upon unacceptable facility stage
          console.error('Facility %s stage is %s, amendment will not be processed', facilityId, facilityStageCode);

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

        if (!!fmr && !!etag && !!facilitySnapshot) {
          const amendments = {
            amendment,
          };

          /**
           * *************************** AMENDMENT SOFs ***************************
           */

          // 1. SOF: Facility Loan Record (FLR)
          // `Bond` facility only
          if (facilitySnapshot.type === FACILITY.FACILITY_TYPE.BOND) {
            facilityLoanRecord = context.df.callSubOrchestrator('acbs-amend-facility-loan-record', {
              facilityId,
              facility,
              amendments,
              fmr,
            });

            yield context.df.Task.all([facilityLoanRecord]);
          } else {
            facilityLoanRecord = {
              result: `Facility type ${facilitySnapshot.type} will not be amended.`,
            };
          }

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
        throw new Error('ACBS facility amendment error : Unable to retrieve FMR');
      }
    }

    throw new Error('Invalid argument set provided');
  } catch (error) {
    console.error('Error amending facility records %o', error);
    return false;
  }
});
