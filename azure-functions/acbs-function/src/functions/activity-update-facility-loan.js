/*
 * Facility loan amendment DAF
 * ***************************
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
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the amendment of a facility loan record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the ACBS facility loan input.
 * 3. Submits the amendment to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the loan ID, facility ID, and ACBS facility loan input.
 * @param {string} payload.loanId - The ID of the loan to be amended.
 * @param {string} payload.facilityId - The ID of the facility to be amended.
 * @param {Object} payload.acbsFacilityLoanInput - The ACBS facility loan input details.
 * @returns {Object} - The result of the facility loan record amendment, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid, if there are missing mandatory fields, or if there is an error during the amendment process.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility loan amendment payload');
    }

    const { loanId, facilityId, acbsFacilityLoanInput } = payload;
    const mandatoryFields = ['expiryDate'];
    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityLoan(facilityId, loanId, acbsFacilityLoanInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility loan amend error',
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityLoanInput,
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
      dataSent: acbsFacilityLoanInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility loan record %o', error);
    throw new Error(`Unable to amend facility loan record ${error}`);
  }
};

df.app.activity('update-facility-loan', {
  handler,
});
