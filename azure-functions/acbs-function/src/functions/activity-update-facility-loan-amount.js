/**
 *
 * Facility loan `amount` amendment DAF
 * ************************************
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
 * Handles the amendment of a facility loan amount in the ACBS system.
 *
 * @param {Object} payload - The payload containing the loanId, facilityIdentifier, and acbsFacilityLoanInput.
 * @param {string} payload.loanId - The ID of the loan.
 * @param {string} payload.facilityIdentifier - The ID of the facility.
 * @param {Object} payload.acbsFacilityLoanInput - The input for the ACBS facility loan, containing the effectiveDate and amountAmendment.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility loan amount amendment payload');
    }

    const mandatoryFields = ['effectiveDate', 'amountAmendment'];
    const { loanId, facilityIdentifier, acbsFacilityLoanInput } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.updateFacilityLoanAmount(facilityIdentifier, loanId, acbsFacilityLoanInput);
    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility loan amount amend error',
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
    console.error('Unable to amend facility loan amount %o', error);
    throw new Error(`Unable to amend facility loan amount ${error}`);
  }
};

df.app.activity('update-facility-loan-amount', {
  handler,
});
