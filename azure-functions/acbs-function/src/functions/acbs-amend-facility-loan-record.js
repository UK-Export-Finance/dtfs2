/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
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
 * 3. DAF (get-facility-loan-id, update-facility-loan-amount, update-facility-loan)
 *
 * ACBS
 * ----
 * This function is responsible for amending FLR.
 * FLR is one of a child record of an issued facility.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

/**
 * Durable Orchestration Function (DOF) for amending a facility loan record in the ACBS system.
 *
 * This function is triggered by an HTTP trigger function and performs the following operations:
 * 1. Validates the input payload.
 * 2. Maps the amendments to the facility loan record.
 * 3. Retrieves the loan ID for the given facility ID.
 * 4. Updates the facility loan amount and cover end date in the ACBS system.
 *
 * @param {Object} context - The context object provided by Durable Functions.
 * @param {Object} context.df - The Durable Functions context.
 * @param {Object} context.df.input - The input payload containing the facility ID, facility details, amendments, and facility master record (FMR).
 * @param {string} context.df.input.facilityId - The ID of the facility to be amended.
 * @param {Object} context.df.input.facility - The facility details.
 * @param {Object} context.df.input.amendments - The amendments to be applied.
 * @param {Object} context.df.input.amendments.amendment - The specific amendment details.
 * @param {Object} context.df.input.fmr - The facility master record.
 * @returns {Object} - The result of the facility loan record amendment.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
df.app.orchestration('acbs-amend-facility-loan-record', function* amendFacilityLoan(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Loan Record amendment SOF - Invalid payload provided');
    }

    const { facilityId, facility, amendments, fmr } = payload;
    const { amendment } = amendments;
    let facilityLoanRecordAmendment;

    // 1.1. Facility Loan Record (FLR) amendment mapping
    const acbsFacilityLoanInput = mappings.facility.facilityLoanAmend(amendments, facility, fmr);

    // 1.2. Extract loan id for facility id
    const loanId = yield context.df.callActivityWithRetry('get-facility-loan-id', retryOptions, {
      facilityId,
    });

    if (loanId) {
      facilityLoanRecordAmendment = {
        loanId,
      };

      // 1.3.1 - UKEF Exposure
      if (amendment.amount) {
        const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
          loanId,
          facilityId,
          acbsFacilityLoanInput,
        });

        facilityLoanRecordAmendment = {
          ...facilityLoanRecordAmendment,
          amount,
        };
      }

      // 1.3.2 - Cover end date
      if (amendment.coverEndDate) {
        const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
          loanId,
          facilityId,
          acbsFacilityLoanInput,
        });

        facilityLoanRecordAmendment = {
          ...facilityLoanRecordAmendment,
          coverEndDate,
        };
      }
    }

    return facilityLoanRecordAmendment;
  } catch (error) {
    console.error('Error amending facility loan record %o', error);
    throw new Error(`Error amending facility loan record ${error}`);
  }
});
