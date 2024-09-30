/**
 *
 * Facility fixed fee `amount` amendment DAF
 * *****************************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */

const df = require('durable-functions');
const api = require('../../api');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * Handles the amendment of a facility fixed fee record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the ACBS facility fixed fee input.
 * 3. Submits the amendment to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility ID and ACBS facility fixed fee input.
 * @param {string} payload.facilityId - The ID of the facility to be amended.
 * @param {Object} payload.acbsFacilityFixedFeeInput - The ACBS facility fixed fee input details.
 * @returns {Object} - The result of the facility fixed fee record amendment, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid, if there are missing mandatory fields, or if there is an error during the amendment process.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility fixed fee amendment payload');
    }

    const { facilityId, acbsFacilityFixedFeeInput } = payload;
    const mandatoryFields = ['partyIdentifier', 'period', 'lenderTypeCode', 'effectiveDate', 'amountAmendment'];
    const missingMandatory = findMissingMandatory(acbsFacilityFixedFeeInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityFixedFeeAmount(facilityId, acbsFacilityFixedFeeInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility fixed fee amount amend error',
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityFixedFeeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityFixedFeeInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility fixed fee record %o', error);
    throw new Error(`Unable to amend facility fixed fee record ${error}`);
  }
};

df.app.activity('update-facility-fixed-fee', {
  handler,
});
