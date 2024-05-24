/**
 * Facility Loan Record amendment SOF
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
 * 3. DAF (activity-get-loan-id, activity-update-facility-loan-amount, activity-update-facility-loan)
 *
 * ACBS
 * ----
 * This function is responsible for amending FLR.
 * FLR is one of a child record of an issued facility.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

df.app.orchestration('acbs-amend-facility-loan-record', function* Facility(context) {
  const payload = context.df.input;

  try {
    if (payload) {
      const { facilityId, facility, amendments, fmr } = payload;
      const { amendment } = amendments;
      let facilityLoanRecordAmendments;

      // 1.1. Facility Loan Record (FLR) amendment mapping
      const flrMApped = mappings.facility.facilityLoanAmend(amendments, facility, fmr);

      // 1.2. Extract loan id for facility id
      const loanId = yield context.df.callActivityWithRetry('activity-get-loan-id', retryOptions, {
        facilityId,
      });

      if (loanId) {
        facilityLoanRecordAmendments = {
          loanId,
        };

        // 1.3.1 - UKEF Exposure
        if (amendment.amount) {
          const amount = yield context.df.callActivityWithRetry('activity-update-facility-loan-amount', retryOptions, {
            loanId,
            facilityId,
            acbsFacilityLoanInput: flrMApped,
          });

          facilityLoanRecordAmendments = {
            ...facilityLoanRecordAmendments,
            amount,
          };
        }

        // 1.3.2 - Cover end date
        if (amendment.coverEndDate) {
          const coverEndDate = yield context.df.callActivityWithRetry('activity-update-facility-loan', retryOptions, {
            loanId,
            facilityId,
            acbsFacilityLoanInput: flrMApped,
          });

          facilityLoanRecordAmendments = {
            ...facilityLoanRecordAmendments,
            coverEndDate,
          };
        }
      }

      return facilityLoanRecordAmendments;
    }
    console.error('No input specified');
  } catch (error) {
    console.error('Error amending facility loan record %o', error);
    throw new Error(`Error amending facility loan record ${error}`);
  }
});
