/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Fixed Feed Record amendment SOF
 * *****************************************
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
const retry = require('../../helpers/retry');
const mapping = require('../../mappings');

/**
 * Durable Orchestration Function (DOF) for amending a facility fixed fee record in the ACBS system.
 *
 * This function is triggered by an HTTP trigger function and performs the following operations:
 * 1. Validates the input payload.
 * 2. Maps the amendments to the facility fixed fee record.
 * 3. Updates the facility fixed fee record in the ACBS system.
 *
 * @param {Object} context - The context object provided by Durable Functions.
 * @param {Object} context.df - The Durable Functions context.
 * @param {Object} context.df.input - The input payload containing the facility ID and amendments.
 * @param {string} context.df.input.facilityId - The ID of the facility to be amended.
 * @param {Object} context.df.input.amendments - The amendments to be applied.
 * @param {Object} context.df.input.amendments.amendment - The specific amendment details.
 * @param {number} context.df.input.amendments.amendment.amount - The amended amount.
 * @returns {Object} - The result of the facility fixed fee record amendment.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
df.app.orchestration('acbs-amend-fixed-fee-record', function* amendFacilityFixedFee(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Facility Fixed Fee Record amendment SOF - Invalid payload provided');
    }

    const { facilityId, amendments } = payload;
    const { amendment } = amendments;
    let facilityFixedFeeRecordAmendment;

    // 5.1 Facility Fixed Fee Record (FFFR) amendment mapping
    if (amendment.amount) {
      const acbsFacilityFixedFeeInput = mapping.facility.facilityFixedFeeAmend(amendments);

      // 5.2. Facility Fixed Fee Record update
      facilityFixedFeeRecordAmendment = yield context.df.callActivityWithRetry('update-facility-fixed-fee', retry, {
        facilityId,
        acbsFacilityFixedFeeInput,
      });
    } else {
      /**
       * Fixed Fees amendments are only applicable for
       * facility amount attribute.
       */
      facilityFixedFeeRecordAmendment = {
        error: 'Non-amount facility amendment',
      };
    }

    return facilityFixedFeeRecordAmendment;
  } catch (error) {
    console.error('Error amending facility fixed fee record %o', error);
    throw new Error(`Error amending facility fixed fee record ${error}`);
  }
});
